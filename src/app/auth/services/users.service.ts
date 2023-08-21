import { Injectable } from '@angular/core';
import { QueryConstraint, Timestamp, where } from '@angular/fire/firestore';
import { getAuth, User } from '@firebase/auth';
import { user } from 'rxfire/auth';
import { combineLatest, defaultIfEmpty, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { StripeSubscriptionInvoice } from '../models/subscription-invoices.model';
import { StripeSubscription } from '../models/subscription.model';
import { User as DbUser, UserDetails, UserUsageDetails, UserUsages } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {	
  private auth = getAuth();

	constructor(
		private db: FirebaseExtendedService,
	) {	}

	get user$(): Observable<DbUser | undefined> {
		return user(this.auth).pipe(
			switchMap(user => {
				if (user && user?.uid) {
					return this.getWithSubscription(user.uid);
				} else {
					return of(undefined);
				}
			})
		)
	};

	get fireUser$(): Observable<User | undefined> {
		return user(this.auth).pipe(
			map((a) => a || undefined)
		);
	};

  /**
   * Update or create a user.
   *
   * @param user User details as firebase.User interface.
   * @param additionalDetails If provides, set additional details to the UserDetails.additional interface.
   */
  async editOrCreate(
    user: User,
    forceEdits: boolean = true,
    additionalDetails?: any,
    isSignup?: boolean
  ): Promise<boolean> {
    try {
      const toFirebaseUser: DbUser = {
        id: user.uid || '',
        name: user.displayName || additionalDetails?.fullName || '',
        email: user.email || '',
        disabled: false,
        details: (isSignup
          ? {
              imgUrl: user.photoURL || 'assets/404_pip_image.png',
              phoneNumber:
                user.phoneNumber || additionalDetails?.phoneNumber || undefined,
            }
          : {
              imgUrl: user.photoURL || undefined,
              phoneNumber:
                user.phoneNumber || additionalDetails?.phoneNumber || undefined,
              lastLogin: Timestamp.fromDate(new Date()),
              profileUrlRef: additionalDetails?.profileUrlRef || undefined,
              firstLogin: false,
            }) as UserDetails,
      };

			if (forceEdits || isSignup) {
				await this.db.upsert(`/users/${user.uid}`, toFirebaseUser);
			}
			
			if (isSignup) {
				localStorage.setItem('returnUrl', '/onboarding');
			}

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Edit user details.
   */
  async edit(uid: string, data: Partial<DbUser>): Promise<void> {
    if (!uid) return;
    await this.db.upsert(`/users/${uid}`, data);
  }

  /**
   * Get all Users with a query (if set).
   *
   * @returns an Observable with a list of Users.
   */
  getAll(...queryConstraints: QueryConstraint[]): Observable<DbUser[]> {
    return this.db.getCol<DbUser>('users', 'id', ...queryConstraints);
	}
	
	
	/**
	 * Retrieves all users with their subscriptions based on the provided query constraints.
	 *
	 * @param {...QueryConstraint[]} queryConstraints - The constraints to apply when querying the users.
	 * @return {Observable<DbUser[]>} An observable that emits an array of users with their subscriptions.
	 */
	getAllWithSubscriptions(...queryConstraints: QueryConstraint[]): Observable<DbUser[]> {
		return this.db.getCol<DbUser>('users', 'id', ...queryConstraints).pipe(
			switchMap(users => {
				const observables = users.map(user =>
					this.db.getCol<StripeSubscription>(
						`users/${user.id}/subscriptions`,
						'id',
						where('status', 'in', ['trialing', 'active'])
					).pipe(
						map(subscriptions => {
							return {
								...user,
								subscriptions
							};
						})
					)
				);
				return combineLatest(observables);
			})
		)
	}

	
	/**
	 * Retrieves all users with their respective usage details.
	 *
	 * @param {QueryConstraint[]} queryConstraints - the constraints to filter the users
	 * @return {Observable<DbUser[]>} an observable emitting an array of users with their usage details
	 */
	getAllWithUsages(...queryConstraints: QueryConstraint[]): Observable<DbUser[]> {
		return this.db.getCol<DbUser>('users', 'id', ...queryConstraints).pipe(
			switchMap(users => {
				const observables = users.map(user => {
					return this.db.getCol<{ id: string }>('supported-docs').pipe(
						switchMap(docs => {
							const usages = docs.map(doc => {
								return this.db.getCol<UserUsageDetails>(`users/${user.id}/protected/usages/${doc.id}`).pipe(
									map(stats => ({ id: doc.id, stats } as UserUsages)),
								)
							});
							return combineLatest(usages);
						}),
						map(usages => ({ ...user, usages })),
					)
				});
				return combineLatest(observables);
			})
		);
	}

	/**
	 * Retrieves a user with their usage details from the database.
	 *
	 * @param {string} id - The id of the user to retrieve.
	 * @return {Observable<DbUser | undefined>} An observable that emits the user with their usage details, or undefined if the user does not exist.
	 */
	getWithUsage(id: string): Observable<DbUser | undefined> {
		return this.db.getDoc<DbUser>(`users/${id}`).pipe(
			switchMap(user => {
				if (!user) return of(undefined);
				return this.db.getCol<{ id: string }>('supported-docs').pipe(
					switchMap(docs => {
						const usages = docs.map(doc => {
							return this.db.getCol<UserUsageDetails>(`users/${user.id}/protected/usages/${doc.id}`).pipe(
								map(stats => ({ id: doc.id, stats } as UserUsages))
							)
						});
						return combineLatest(usages);
					}),
					map(usages => ({ ...user, usages }))
				)
			})
		)
	}
	
	/**
	 * Retrieves all users with their invoices based on the provided query constraints.
	 *
	 * @param {QueryConstraint[]} ...queryConstraints - The query constraints to filter the users.
	 * @return {Observable<DbUser[]>} - An observable that emits an array of DbUser objects with their associated invoices.
	 */
	getAllWithInvoices(...queryConstraints: QueryConstraint[]): Observable<DbUser[]> {
		return this.getAllWithUsages(...queryConstraints).pipe(
			switchMap(users => {
				const observables = users.map(user =>
					this.db.getCol<StripeSubscription>(`users/${user.id}/subscriptions`).pipe(
						defaultIfEmpty([]),
						switchMap((subsc) => {
							const invoicesObservables = subsc.map(sub => {
								return this.db
									.getCol<StripeSubscriptionInvoice>(`users/${user.id}/subscriptions/${sub.id}/invoices`)
									.pipe(
										defaultIfEmpty([]),
										map((invoices) => ({ ...sub, invoices } as StripeSubscription)),
									);
							});
							return combineLatest(invoicesObservables)
								.pipe(defaultIfEmpty([]));
						}),
						defaultIfEmpty([]),
						map(subscriptions => {
							return {
								...user,
								subscriptions
							} as DbUser;
						})
					)
				);
				return combineLatest(observables)
					.pipe(defaultIfEmpty([]));
			})
		)
	}

	/**
	 * Retrieves a user with their associated invoices from the database.
	 *
	 * @param {string} id - The ID of the user to retrieve.
	 * @return {Observable<DbUser | undefined>} An observable that emits the user object with associated invoices, or undefined if the user is not found.
	 */
	getWithInvoice(id: string): Observable<DbUser | undefined> {
		return this.getWithUsage(id).pipe(
			switchMap(user => {
				if (!user) return of(undefined);
				return this.db.getCol<StripeSubscription>(`users/${user.id}/subscriptions`).pipe(
					defaultIfEmpty([]),
					switchMap((subsc) => {
						const invoicesObservables = subsc.map(sub => {
							return this.db
								.getCol<StripeSubscriptionInvoice>(`users/${user.id}/subscriptions/${sub.id}/invoices`)
								.pipe(map((invoices) => ({ ...sub, invoices } as StripeSubscription)));
						});
						return combineLatest(invoicesObservables).pipe(defaultIfEmpty([]));
					}),
					map(subscriptions => {
						return {
							...user,
							subscriptions
						};
					})
				)
			})
		)
	}

  /**
   * Get a single user.
   *
   * @param id Set it to firebase.User.uid
   */
  get(id: string): Observable<DbUser | undefined> {
		return this.db.getDoc<DbUser>(`users/${id}`).pipe(
			map((u) => {
				if (!u) return undefined;
				return { ...u, id };
			})
		);
	}
	
	/**
	 * Retrieves a single user from the database with the given ID.
	 *
	 * @param {string} id - The ID of the user to retrieve.
	 * @return {Observable<DbUser | undefined>} An observable that emits the user object if found, or undefined if not found.
	 */
	getWithSubscription(id: string): Observable<DbUser | undefined> {
		return this.db.getDoc<DbUser>(`users/${id}`).pipe(
			switchMap(user => {
				if (!user) return of(undefined);
				return this.db.getCol<StripeSubscription>(
					`users/${user.id}/subscriptions`,
					'id',
					where('status', 'in', ['trialing', 'active'])
				).pipe(
					map(subscriptions => {
						return {
							...user,
							subscriptions
						};
					})
				)
			})
		)
	}

  /**
   * Get current user from Firebase.
   */
  getCurrentFire(): Promise<User | undefined> {
		return firstValueFrom(
			user(this.auth).pipe(
				map((a) => a || undefined)
			)
		);
	}
}
