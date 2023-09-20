import { Injectable } from '@angular/core';
import { limit, orderBy } from '@angular/fire/firestore';
import { Observable, map, switchMap } from 'rxjs';
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
	
	/* getUsage(): Observable<CompletionStat[]> {
		return this._getCurrentUid$().pipe(
			switchMap(uid => {
				return this.db.getCol<{ id: string }>('supported-docs').pipe(
					map(docs => {
						return { d: docs.map(doc => doc?.id).filter(d => !!d), uid }
					})
				)
			}),
			switchMap(data => {
				const month = new Date().getMonth();
				const date = `${month < 10 ? '0' : ''}${month}_${new Date().getFullYear()}`;
				const observables = data.d.map(docId => {
					return this.db.getDoc<CompletionStat>(
						`users/${data.uid}/protected/usages/${docId}/${date}`
					)
				});
				return combineLatest(observables).pipe(
					map(stats => stats.filter(s => !!s) as CompletionStat[]),
				);
			}),
		)
	} */

	getThisPeriodPrompts() {
		return this._getCurrentUid$().pipe(
			switchMap(uid => {
				return this.db.getCol<{ count: number }>(`users/${uid}/protected/usages/bySubscription`, 'id', orderBy('createdAt', 'desc'), limit(1))
					.pipe(map(docs => docs?.at(0)?.count || 0))
			})
		)
	}

	private _getCurrentUid$(): Observable<string> {
		return this.users.fireUser$.pipe(map((u) => u?.uid || ''))
	}
}
