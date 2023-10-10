import { Injectable } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { AppFeedback } from '../models/app-feedback.model';


@Injectable({
  providedIn: 'root'
})
export class AppFeedbacksService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getAll(): Observable<AppFeedback[]> {
		return this.db.getCol<AppFeedback>('/app/feedbacks/all', 'id', orderBy('createdAt', 'desc')).pipe(
			switchMap((res) => {
				const observables = res.map((f) => {
					const uid = f.uid;
					return this.db.getDoc<User>(`users/${uid}`).pipe(
						map((user) => ({
							...f,
							user,
						}) as AppFeedback)
					);
				});
				return combineLatest(observables);
			})
		);
	}
}
