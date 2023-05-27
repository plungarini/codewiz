import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { animationFrameScheduler, catchError, finalize, of, Subscription } from 'rxjs';
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

	@ViewChild('mainChatContainer', { static: true }) mainChatContainer: ElementRef<HTMLDivElement> | undefined;

	private selectedRepo: AiChatRepo = AiChatRepo.Angular;
	gettingQuery = false;
	autoscroll: boolean = true;
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
		private cdRef: ChangeDetectorRef,
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
		if (this.gettingQuery) return console.error('Another query is already running...');

		// TODO: Save query to Database
		const userQuery: AiChatMessage = {
			role: AiChatMessageRole.User,
			content: query,
			completed: false,
			// timestamp etc...
		}
		const assistantRes: AiChatMessage = {
			role: AiChatMessageRole.Assistant,
			content: '',
			completed: false,
			// timestamp etc...
		}
		this.chat.push(userQuery, assistantRes);

		this.onMessageScroll(true);

		const newMsgIndex = this.chat.length - 1;
		this.gettingQuery = true;
		this.cdRef.detectChanges();

		let backupResult = '';
		this.ai.createQuery(this.selectedRepo, [...this.chat])
			.pipe(
				catchError((err) => {
					const parsedErr = err.data ? JSON.parse(err.data) : { message: '', debug: undefined };
					this.chat[newMsgIndex].content = backupResult;
					this.chat[newMsgIndex].completed = true;
					this.chat[newMsgIndex].error = {
						debug: parsedErr?.debug,
						message: parsedErr?.message,
					};

					this.cdRef.detectChanges();
					console.error(parsedErr);
					this.pingStatus();
					return of(undefined);
				}),
				finalize(() => {
					this.gettingQuery = false;
					this.chat[newMsgIndex].completed = true;
					this.cdRef.detectChanges();
					return of(undefined);
				})
			)
			.subscribe((val) => {
				if (!val) return;
				backupResult = val.completion;

				this.chat[newMsgIndex].content = val.completion;

				this.onMessageScroll();
				
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

	private onMessageScroll(bypass = false) {
		if (!this.mainChatContainer) return;
		const element = this.mainChatContainer.nativeElement;

    // Check if the user has scrolled to the bottom
		const offset = 25;
		const autoscroll = element.scrollHeight - element.scrollTop <= element.clientHeight + offset;

    // If the user has scrolled to the bottom, automatically scroll to the new message
		if (autoscroll || bypass) {
			const sub = animationFrameScheduler.schedule(() => {
				this.mainChatContainer?.nativeElement.scroll({
					top: element.scrollHeight,
					behavior: 'smooth'
				});
				sub.unsubscribe();
			})
    }
  }
}
