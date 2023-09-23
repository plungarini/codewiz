import { Injectable } from '@angular/core';
import { limit, orderBy } from '@angular/fire/firestore';
import { map, Observable, switchMap } from 'rxjs';
import { Timestamp } from 'src/app/auth/models/timestamp.model';
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
				return this.db.getCol<{ count: number, createdAt?: Timestamp }>(`users/${uid}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
					.pipe(
						map(docs => {
							const current = docs?.at(0);
							if (!current) return 0;
							const thisMonth = new Date().getMonth();
							const res = current.createdAt?.toDate().getMonth() !== thisMonth ? 0 : docs.at(0)?.count ?? 0;
							return res;
						})
					)
			})
		)
	}

	private _getCurrentUid$(): Observable<string> {
		return this.users.fireUser$.pipe(map((u) => u?.uid ?? ''))
	}
}
