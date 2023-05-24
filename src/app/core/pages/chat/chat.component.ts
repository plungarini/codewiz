import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { AiChatStatusIndicator } from 'src/app/shared/models/ai-chat/ai-chat-status.model';
import { AiChatMessage, AiChatMessageRole, AiChatRepo } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';



type ClientStatus = {
	title: string,
	message: string,
	link: string,
	indicator: AiChatStatusIndicator,
}

@Component({
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnDestroy {

	private selectedRepo: AiChatRepo = AiChatRepo.Angular;
	gettingQuery = false;
	chat: AiChatMessage[] = [];
	status: ClientStatus = {
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
			const newStatus = {
				indicator: s.status.indicator || AiChatStatusIndicator.None,
				title: s.incidents[0]?.name || AiChatStatusIndicator.None ? '' : 'Unable to detect OpenAI status',
				message: s.incidents[0]?.incident_updates[0].body || AiChatStatusIndicator.None ? '' : 'Click here to visit the status webpage.',
				link: s.incidents[0]?.shortlink || AiChatStatusIndicator.None ? '' : 'https://status.openai.com/',
			};
			this.status = newStatus;
			console.warn('New openai status', this.status);
			this.cdRef.detectChanges();
		})
	}

	ngOnDestroy(): void {
		this.statusSubscription.unsubscribe();
	}

	createQuery(query: string): void {
		if (!query) return console.error('Query is required.');
		console.log('Getting reply from query: ' + query);

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

}
