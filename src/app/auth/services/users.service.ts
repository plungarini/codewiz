import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { getAuth, User } from '@firebase/auth';
import { user } from 'rxfire/auth';
import { firstValueFrom, Observable, ReplaySubject, take } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-extended.service';
import { User as DbUser, UserDetails } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  public currentUserDb$: ReplaySubject<DbUser> = new ReplaySubject(1);

  private defaultRole: DbUser['role'] = {
		id: 'customer',
		name: 'Customer',
		permissions: [],
  };
  private auth = getAuth();

	constructor(
		private db: FirebaseExtendedService,
	) { }

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
        role: additionalDetails?.role || this.defaultRole,
        details: (isSignup
          ? {
              imgUrl: user.photoURL || null,
              phoneNumber:
                user.phoneNumber || additionalDetails?.phoneNumber || null,
              lastLogin: Timestamp.fromDate(new Date()),
              profileUrlRef: additionalDetails?.profileUrlRef || null,
            }
          : {
              imgUrl: user.photoURL || null,
              phoneNumber:
                user.phoneNumber || additionalDetails?.phoneNumber || null,
              lastLogin: Timestamp.fromDate(new Date()),
              profileUrlRef: additionalDetails?.profileUrlRef || null,
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
    return this.db.getDoc<DbUser>(`users/${id}`);
  }

  /**
   * Get current user from Firebase.
   */
  getCurrentFire(): Promise<User | null> {
		return firstValueFrom(
			user(this.auth).pipe(
				take(1),
			)
		);
  }
}
