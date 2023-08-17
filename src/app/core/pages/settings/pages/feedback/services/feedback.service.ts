import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { UserFeedback } from '../models/feedback.model';


@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

	readonly FEEDBACK_DAY_LIMIT = 5;

	constructor(
		private db: FirebaseExtendedService,
		private users: UsersService,
	) { }

	getCurrentUserFeedbacks(): Observable<UserFeedback[]> {
		return this._$getCurrentUid().pipe(
			switchMap((uid) => this.db.getCol<UserFeedback>('app/feedbacks/all', 'id', where('uid', '==', uid))),
		)
	}
	
	async saveFeedback(data: Partial<UserFeedback>): Promise<void> {
		if (!data.content) throw new Error('Content is required');
		const uid = await this._getCurrentUid();
		if (!uid) throw new Error('User not logged in');
		const id = data.id || this.db.generateId();
		data.uid = uid;
		const canSend = await this.canSendFeedback();
		
		if (!canSend) throw new Error('You can\'t send more than 5 feedback a day.');
		await this.db.upsert(`app/feedbacks/all/${id}`, data);
	}

	private async canSendFeedback() {
		const feedbacks = await firstValueFrom(this.getCurrentUserFeedbacks());
		const todayFeedbacks = feedbacks.filter((feedback) => feedback.createdAt.toDate().toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
		return todayFeedbacks.length < this.FEEDBACK_DAY_LIMIT;
	}

	private _$getCurrentUid(): Observable<string> {
		return this.users.fireUser$.pipe(map((u) => u?.uid || ''))
	}

	private _getCurrentUid(): Promise<string> {
		return firstValueFrom(this._$getCurrentUid())
	}

}
