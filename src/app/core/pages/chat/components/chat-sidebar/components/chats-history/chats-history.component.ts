import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';
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
export class ChatsHistoryComponent implements OnInit {

	@Input('chatHistory') set setChatHistory(value: any[]) {
		if (!value) {
			this.chatHistory = [];
			return
		};
		this.chatHistory = value.map((v) => {
			if (!v.name || v.name === 'New chat') {
				this.getChatTitle(v.id);
			}
			return v;
		});
	};

	chatHistory: any[] = [];
	
	private queue: Set<string> = new Set();

	constructor(
		private aiChatService: AiChatService,
		private cdRef: ChangeDetectorRef,
	) { }

	ngOnInit(): void {
	}

	getChatTitle(id: string) {
		if (this.queue.has(id)) return;

		this.aiChatService.createChatTitle(
			[
				{
					completed: true,
					content: 'Hello, I need to implement a search feature in my Angular component using mock data. Can you help me with that?',
					role: AiChatMessageRole.User,
				},
				{
					completed: true,
					content: 'Hi there! Sure, one way to do that is to create a mock service that returns an array of objects that resemble the data you expect to receive from the server.',
					role: AiChatMessageRole.Assistant,
				},
				{
					completed: true,
					content: 'Okay, how should I structure the mock data?',
					role: AiChatMessageRole.User,
				},
				{
					completed: true,
					content: 'You can structure the data using a class that defines the properties you need',
					role: AiChatMessageRole.Assistant,
				},
				{
					completed: true,
					content: 'Hello again, I have another question. How can I implement pagination with mock data in my Angular component?',
					role: AiChatMessageRole.User,
				},
				{
					completed: true,
					content: 'Hi there! To implement pagination with mock data, you can modify the mock service to return a subset of the data based on the current page and page size.',
					role: AiChatMessageRole.Assistant,
				},
				{
					completed: true,
					content: 'Okay, thank you!',
					role: AiChatMessageRole.User,
				},
			]
		).subscribe(async (d) => {
			this.queue.add(id);
			
			const i = this.chatHistory.findIndex(c => c.id === id);
			this.chatHistory[i].name = d.completion;
			console.log(d.completion);

			if (!!d.finishReason) {
				this.queue.delete(id);
				await this.saveChatName(d.completion, id);
			};

			this.cdRef.detectChanges();
		})
	}

	private async saveChatName(title: string, id: string): Promise<void> {
		const chat = this.chatHistory.find(c => c.id === id);
		await this.aiChatService.saveChatName(title, chat.repo, id);
	}

}
