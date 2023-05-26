import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { AiChatStatusIndicator, ClientOpenaiStatus } from 'src/app/shared/models/ai-chat/ai-chat-status.model';
import { AiChatMessage, AiChatMessageRole, AiChatRepo } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';


@Component({
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
				@apply w-full max-h-full overflow-hidden;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnDestroy {

	private selectedRepo: AiChatRepo = AiChatRepo.Angular;
	gettingQuery = false;
	chat: AiChatMessage[] = [];
	status: ClientOpenaiStatus = {
		title: 'OpenAI\'s APIs are online',
		message: '',
		link: 'https://status.openai.com/',
		indicator: AiChatStatusIndicator.None,
	}

	statusSubscription: Subscription;

	constructor(
		private ai: AiChatService,
		private cdRef: ChangeDetectorRef
	) {
		this.statusSubscription = this.ai.getStatus().subscribe((s) => {
			this.status = s;
			console.warn('New openai status', this.status);
			this.cdRef.detectChanges();
		})
	}

	ngOnDestroy(): void {
		this.statusSubscription.unsubscribe();
	}

	createQuery(query: string): void {
		if (!query) return console.error('Query is required.');

		// TODO: Save query to Database
		const userQuery: AiChatMessage = {
			role: AiChatMessageRole.User,
			content: query,
			// timestamp etc...
		}
		this.chat.push(userQuery);
		this.chat = [...this.chat]

		const newMsgIndex = this.chat.length;
		this.gettingQuery = true;
		this.cdRef.detectChanges();

		this.ai.createQuery(this.selectedRepo, [...this.chat])
			.pipe(
				catchError((err) => {
					const parsedErr = err.data ? JSON.parse(err.data) : { message: '', debug: undefined };
					this.chat[newMsgIndex] = {
						role: AiChatMessageRole.Assistant,
						content: '',
						error: {
							debug: parsedErr?.debug,
							message: parsedErr?.message,
						}
					};
					this.chat = [...this.chat];
					console.log(this.chat[newMsgIndex]);
					this.cdRef.detectChanges();
					this.pingStatus();
					return of(undefined);
				}),
				finalize(() => {
					this.gettingQuery = false;
					this.cdRef.detectChanges();
					return of(undefined);
				})
			)
			.subscribe((val) => {
				if (!val) return;
				this.chat[newMsgIndex] = {
					role: AiChatMessageRole.Assistant,
					content: val,
				};
				this.chat = [...this.chat];
				// TODO: Save response to Database
				this.cdRef.detectChanges();
			});
	}

	private async pingStatus(): Promise<void> {
		const s = await this.ai.getStatusPromise();
		this.status = s;
		console.warn('New openai status', this.status);
		this.cdRef.detectChanges();
	}
}
