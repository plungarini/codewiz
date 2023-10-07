import { Injectable } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { LernFeedback } from '../models/lern-feedback.model';

@Injectable({
  providedIn: 'root'
})
export class LernFeedbacksService {

  constructor(
		private db: FirebaseExtendedService,
	) { }

	getAll(): Observable<LernFeedback[]> {
		return this.db.getCol<LernFeedback>('/app/feedbacks/lern', 'id', orderBy('createdAt', 'desc')).pipe(
			switchMap((res) => {
				const observables = res.map((f) => {
					const uid = f.uid;
					return this.db.getDoc(`lern/${uid}/courses/${f.courseId}`).pipe(
						switchMap((course) => {
							return this.db.getDoc<User>(`users/${uid}`).pipe(
								map((user) => ({
									...f,
									course,
									user,
								}) as LernFeedback)
							);
						})
					)
				});
				return combineLatest(observables);
			})
		);
	}
}
