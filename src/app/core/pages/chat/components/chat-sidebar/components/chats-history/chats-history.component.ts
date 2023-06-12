import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  selector: 'app-chats-history',
  templateUrl: './chats-history.component.html',
  styles: [
    `
      :host {
        @apply block mt-4;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatsHistoryComponent {

	@Input('chatHistory') set setChatHistory(value: any[]) {
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
	};

	chatHistory: any[] = [];
	currentChatId: string = '';
	
	private queue: Set<string> = new Set();

	constructor(
		private aiChatService: AiChatService,
		private cdRef: ChangeDetectorRef,
	) {	}

	trackBy(i: number, obj: any): string {
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
