import { Injectable } from '@angular/core';
import { firstValueFrom, map, of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { LernFeedback } from '../models/feedback.model';


@Injectable({
  providedIn: 'root'
})
export class LernFeedbackService {

	constructor(
		private users: UsersService,
		private db: FirebaseExtendedService,
	) { }

	getFeedback(courseId?: string) {
		return this._getCurrentUid$().pipe(
			switchMap((uid) => {
				if (!uid || !courseId) return of(undefined);
				return this.db.getDoc<LernFeedback>(`/app/feedbacks/lern/${uid}/courses/${courseId}`);
			})
		)
	}

	async setFeedback(courseId: string, feedback: Partial<LernFeedback>) {
		const uid = await firstValueFrom(this._getCurrentUid$());
		if (!uid) return;
		return this.db.upsert<LernFeedback>(`/app/feedbacks/lern/${uid}/courses/${courseId}`, feedback);
	}

	private _getCurrentUid$() {
		return this.users.fireUser$.pipe(map(user => user?.uid))
	}

	private _getCurrentUid() {
		return firstValueFrom(this._getCurrentUid$());
	}
}
