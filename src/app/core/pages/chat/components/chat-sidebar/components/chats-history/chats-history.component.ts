import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiUserRepoChat } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  selector: 'app-chats-history',
  templateUrl: './chats-history.component.html',
  styles: [
    `
      :host {
        @apply block mt-4 overflow-x-hidden overflow-y-scroll pr-5 shrink;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatsHistoryComponent {

	groupedDocuments: { date: string, documents: AiUserRepoChat[] }[] = [];

	@Input('chatHistory') set setChatHistory(value: AiUserRepoChat[]) {
		if (!value) {
			this.chatHistory = [];
			return
		};
		this.chatHistory = value.map((c) => {
			if (!c.name || c.name === 'New Chat') {
				this.getChatTitle(c.repo, c.id);
			}
			return c;
		});

		// Group documents by date
		const grouped: Record<string, AiUserRepoChat[]> = {};
		this.chatHistory.forEach((c) => {
			const updatedAt = c.updatedAt?.toDate() || new Date();
			const now = new Date();
			const diffInDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
			let key;
			if (diffInDays < 7) {
				// If updated less than 1 week ago, group by date
				key = updatedAt.toDateString();
			} else {
				// Otherwise, group by month and year
				key = `${updatedAt.toLocaleString('default', { month: 'short' })} ${updatedAt.getFullYear()}`;
			}
			if (!grouped[key]) {
				grouped[key] = [];
			}
			grouped[key].push(c);
		});

		this.groupedDocuments = Object.keys(grouped).map((key) => {
			return {
				date: key,
				documents: grouped[key],
			};
		});
	};

	chatHistory: AiUserRepoChat[] = [];
	currentChatId: string = '';
	
	private queue: Set<string> = new Set();

	constructor(
		private aiChatService: AiChatService,
		private cdRef: ChangeDetectorRef,
	) {	}

	trackBy(i: number, obj: AiUserRepoChat): string {
		return obj?.id || i.toString();
	}

	getChatTitle(repo: string, id: string) {
		if (this.queue.has(id)) return;
		
		const chatIndex = this.chatHistory.findIndex(c => c.id === id);
		if (this.chatHistory[chatIndex]?.name !== 'new' && !!this.chatHistory[chatIndex]?.name) return;

		const sub = this.aiChatService.createChatTitle(repo, id)
			.subscribe(async (d) => {
				if (!d.shouldUpdate) return;

				this.queue.add(id);
			
				const index = this.chatHistory.findIndex(c => c.id === id);
				this.chatHistory[index].name = d.completion;

				if (!!d.finishReason) {
					this.queue.delete(id);
					await this.saveChatName(d.completion, id);
					sub.unsubscribe();
				};

				this.cdRef.detectChanges();
			});
	}

	private async saveChatName(title: string, id: string): Promise<void> {
		const chat = this.chatHistory.find(c => c.id === id);
		await this.aiChatService.saveChatName(title, chat.repo, id);
	}

}
