import { Injectable } from '@angular/core';
import { limit, orderBy } from '@angular/fire/firestore';
import { map, Observable, of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from './firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class UserUsagesService {

	constructor(
		private db: FirebaseExtendedService,
		private users: UsersService,
	) { }

	getTotalPrompts(uid?: string) {
		return this._getCurrentUid$(uid).pipe(
			switchMap(userUid => {
				return this.db.getCol<{ count: number }>(`users/${userUid}/protected/usages/bySubscription`)
			}),
			map(docs => docs.reduce((acc, doc) => acc + (doc.count ?? 0), 0))
		);
	}

	getThisPeriodPrompts(uid?: string) {
		return this._getCurrentUid$(uid).pipe(
			switchMap(userUid => {
				return this.db.getCol<{ count: number }>(`users/${userUid}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
					.pipe(
						map(docs => {
							const current = docs?.at(0);
							if (!current) return 0;
							return current.count ?? 0;
						})
					)
			})
		)
	}

	getAdditionalPromptCredits(uid?: string) {
		return this._getCurrentUid$(uid).pipe(
			switchMap(userId => {
				return this.db.getCol<{ chatCreditsUsed: number }>(`users/${userId}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
					.pipe(
						map(docs => {
							const current = docs?.at(0);
							if (!current) return { used: 0, userId };
							return { used: current.chatCreditsUsed ?? 0, userId };
						})
					)
			}),
			switchMap(({ userId, used }) => {
				return this.db.getDoc<{ chatCredits: number }>(`users/${userId}/protected/usages`)
					.pipe(
						map(doc => {
							if (!doc) return { credits: 0 };
							const credits = doc.chatCredits ?? 0;
							return { credits: credits + used };
						})
					)
			})
		)
	}

	getTotalLern(uid?: string) {
		return this._getCurrentUid$(uid).pipe(
			switchMap(userUid => {
				return this.db.getCol<{ lernCount: number }>(`users/${userUid}/protected/usages/bySubscription`)
			}),
			map(docs => docs.reduce((acc, doc) => acc + (doc.lernCount ?? 0), 0))
		);
	}

	getThisPeriodLern(uid?: string) {
		return this._getCurrentUid$(uid).pipe(
			switchMap(userId => {
				return this.db.getCol<{ lernCount: number }>(`users/${userId}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
					.pipe(
						map(docs => {
							const current = docs?.at(0);
							if (!current) return 0;
							return current.lernCount ?? 0;
						})
					)
			})
		)
	}

	getAdditionalLernCredits(uid?: string) {
		return this._getCurrentUid$(uid).pipe(
			switchMap(userUid => {
				return this.db.getCol<{ lernCreditsUsed: number }>(`users/${userUid}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
					.pipe(
						map(docs => {
							const current = docs?.at(0);
							if (!current) return { used: 0, userUid };
							return { used: current.lernCreditsUsed ?? 0, userUid };
						})
					)
			}),
			switchMap(({ userUid, used }) => {
				return this.db.getDoc<{ lernCredits: number; lernDemoUsed: boolean }>(`users/${userUid}/protected/usages`)
					.pipe(
						map(doc => {
							if (!doc) return { credits: 1 };
							const credits = doc.lernCredits ?? 0;
							const demo = doc.lernDemoUsed ? 0 : 1;
							return { credits: credits + demo + used };
						})
					)
			})
		)
	}

	private _getCurrentUid$(uid?: string): Observable<string> {
		return uid ? of(uid) : this.users.fireUser$.pipe(map((u) => u?.uid ?? ''));
	}
}
