import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { AiChatMessageFeedback } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { ChatFeedback } from '../models/chat-feedback.model';

@Injectable({
  providedIn: 'root'
})
export class ChatFeedbacksService {

  constructor(
		private db: FirebaseExtendedService,
	) { }

	getAll(): Observable<ChatFeedback[]> {
		return this.db.getCol<AiChatMessageFeedback>('app/feedbacks/chat/').pipe(
			switchMap((res) => {
				const observables = res.map((f) => {
					const uid = f.uid;
					return this.db.getDoc<User>(`users/${uid}`).pipe(
						map((user) => ({
							...f,
							user,
						}) as ChatFeedback)
					);
				});
				return combineLatest(observables);
			})
		)
	}
}
