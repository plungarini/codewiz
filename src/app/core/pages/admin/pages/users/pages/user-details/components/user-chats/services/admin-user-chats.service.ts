import { Injectable } from '@angular/core';
import { combineLatest, map, switchMap } from 'rxjs';
import { Timestamp } from 'src/app/auth/models/timestamp.model';
import { AiChatMessage } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { Repo } from 'src/app/shared/models/repo.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserChatsService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getAllChats(uid: string) {
		const supported$ = this.db.getCol<Repo>(`supported-docs`);
		const repos$ = supported$.pipe(
			switchMap((repos) => {
				const observables = repos.map((repo) => {
					return this.db.getCol<{ name: string; id: string; createdAt: Timestamp; updatedAt: Timestamp }>(`users/${uid}/repos/${repo.id}/chats`).pipe(
						map((chats) => (
							chats.map((c) => ({
								...c,
								repo,
							}))
						))
					);
				});
				return combineLatest(observables).pipe(
					map(res => {
						return res.flat().sort((a, b) => {
							return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime();
						});
					})
				);
			})
		);

		return repos$;
	}

	getChatMessages(uid: string, repoId: string, chatId: string) {
		return this.db.getCol<AiChatMessage>(`users/${uid}/repos/${repoId}/chats/${chatId}/messages`).pipe(
			map((messages) => {
				return messages.sort((a, b) => {
					return (b.createdAt?.toDate()?.getTime() ?? 0) - (a.createdAt?.toDate()?.getTime() ?? 0);
				});
			})
		)
	}
}
