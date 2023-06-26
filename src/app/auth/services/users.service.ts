import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { getAuth, User } from '@firebase/auth';
import { user } from 'rxfire/auth';
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { User as DbUser, UserDetails } from '../models/user.model';

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
					return this.get(user.uid);
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
              imgUrl: user.photoURL || undefined,
              phoneNumber:
                user.phoneNumber || additionalDetails?.phoneNumber || undefined,
              lastLogin: Timestamp.fromDate(new Date()),
              profileUrlRef: additionalDetails?.profileUrlRef || undefined,
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
  getAll(query?: any): Observable<DbUser[]> {
    return this.db.getCol<DbUser>('users', query);
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
