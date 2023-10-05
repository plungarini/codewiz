import { Injectable } from '@angular/core';
import { limit, orderBy } from '@angular/fire/firestore';
import { map, Observable, switchMap } from 'rxjs';
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

	getThisPeriodPrompts() {
		return this._getCurrentUid$().pipe(
			switchMap(uid => {
				return this.db.getCol<{ count: number }>(`users/${uid}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
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

	getThisPeriodLern() {
		return this._getCurrentUid$().pipe(
			switchMap(uid => {
				return this.db.getCol<{ lernCount: number }>(`users/${uid}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
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

	getAdditionalLernCredits() {
		return this._getCurrentUid$().pipe(
			switchMap(uid => {
				return this.db.getDoc<{ lernCredits: number; lernDemoUsed: boolean }>(`users/${uid}/protected/usages`)
					.pipe(
						map(doc => {
							if (!doc) return { credits: 0 };
							const credits = doc.lernCredits ?? 0;
							const demo = doc.lernDemoUsed ? 0 : 1;
							return { credits: credits + demo };
						})
					)
			})
		)
	}

	private _getCurrentUid$(): Observable<string> {
		return this.users.fireUser$.pipe(map((u) => u?.uid ?? ''))
	}
}
