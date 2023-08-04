import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AiUserRepoChat } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  selector: 'app-chats-history',
  templateUrl: './chats-history.component.html',
  styles: [
    `
      :host {
        @apply block mt-2 overflow-x-hidden overflow-y-auto pr-6 shrink;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatsHistoryComponent {
	@Input('chatHistory') set setChatHistory(value: AiUserRepoChat[]) {
		if (!value) {
			this.chatHistory = [];
			return
		};
		this.chatHistory = value;
		this.chatHistory.forEach((c) => {
			if (!c.name || c.name === 'New Chat') {
				this.getChatTitle(c.repo, c.id);
			}
		})

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

	@Output('onDelete') onDelete = new EventEmitter<{ repo: string; id: string }>();

	groupedDocuments: { date: string, documents: AiUserRepoChat[] }[] = [];
	chatHistory: AiUserRepoChat[] = [];
	currentChatId: string = '';
	
	private queue: Set<string> = new Set();

	private aiChatService = inject(AiChatService);
	private cdRef = inject(ChangeDetectorRef);
	
	constructor() { }

	trackBy(i: number, obj: AiUserRepoChat): string {
		return obj?.id || i.toString();
	}

	async getChatTitle(repo: string, id: string): Promise<void> {
		if (this.queue.has(id)) return;
		
		const chatIndex = this.chatHistory.findIndex(c => c.id === id);

		if (chatIndex < 0) return;
		
		if (!!this.chatHistory[chatIndex]?.name && this.chatHistory[chatIndex]?.name !== 'New Chat') return;

		const chatLen = await this.aiChatService.getChatMessageLength(repo, id);

		if (chatLen < 3) return;

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

	deleteChat(repo: string, id: string): void {
		if (!repo || !id) return console.error('Error on delete, chat repo or chat id is undefined', { repo, id });
		this.onDelete.emit({ repo, id });
	}

}
