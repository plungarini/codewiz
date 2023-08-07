import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { animationFrameScheduler, catchError, finalize, of, Subscription, switchMap } from 'rxjs';
import { AiChatStatusIndicator, ClientOpenaiStatus } from 'src/app/shared/models/ai-chat/ai-chat-status.model';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';



@Component({
  templateUrl: './chat-view.component.html',
  styles: [
    `
      :host {
        @apply relative w-full;
				display: inline-grid;
      }
    `
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatViewComponent implements OnDestroy {
	@ViewChild('mainChatContainer', { static: true }) mainChatContainer: ElementRef<HTMLDivElement> | undefined;

	gettingQuery = false;
	autoscroll: boolean = true;
	chat: AiChatMessage[] = [];

	private oldChat: AiChatMessage[] = [];
	private maxResultsLoaded = false;
	private messageLimit = 10;
	
	status: ClientOpenaiStatus = {
		title: 'OpenAI\'s APIs are online',
		message: '',
		link: 'https://status.openai.com/',
		indicator: AiChatStatusIndicator.None,
	}
	
	statusSub: Subscription;
	chatSub: Subscription | undefined;
	selectedRepo: string = 'angular';
	chatLoaded = false;
	private chatId: string = '';

	constructor(
		private ai: AiChatService,
		private cdRef: ChangeDetectorRef,
		private route: ActivatedRoute,
		private router: Router,
		@Inject(DOCUMENT) private document: Document,
	) {
		this.statusSub = this.ai.getStatus().subscribe((s) => {
			this.status = s;
			console.warn('New openai status', this.status);
			this.cdRef.detectChanges();
		});
		this.chatSub = this.route.paramMap
			.pipe(
				switchMap((params) => {
					const repo = params.get('repo');
					const id = params.get('id');

					if (repo) {
						this.selectedRepo = repo;
					}

					if (id && id !== this.chatId) {
						this.chatId = id;
						this.chatLoaded = false;
						this.oldChat = [];
						this.cdRef.markForCheck();
					}

					if (!id || !repo) {
						this.router.navigateByUrl(`/app/chat/${repo || 'angular'}/new`);
						return of([])
					};

					return this.ai.getChatMessages(repo, id, this.messageLimit);
				}),
		).subscribe((messages) => {
			this.chat = [...messages, ...this.oldChat].sort((a, b) => {
				return (a.createdAt?.toDate().getTime() || 0) - (b.createdAt?.toDate().getTime() || 0);
			});
			this.cdRef.markForCheck();	
			
			if (messages.length <= 0) {
				const repo = this.route.snapshot.paramMap.get('repo');
				this.router.navigateByUrl(`/app/chat/${repo}/new`);
				this.cdRef.markForCheck();
			}

			if (!this.chatLoaded) {
				this.chatLoaded = true;
				this.onMessageScroll(true, false);
				this.cdRef.markForCheck();
			};
		});
	}

	ngOnDestroy(): void {
		this.statusSub.unsubscribe();
		this.chatSub?.unsubscribe();
	}

	async onChatScroll(event: any): Promise<void> {
		const scrolledToTop = this.mainChatContainer?.nativeElement.scrollTop === 0;
		if (scrolledToTop && this.chat.length > 5 && !this.maxResultsLoaded) {
			console.warn('Loading more messages...');
			const now = new Date();
			this.chatLoaded = false;
			this.cdRef.markForCheck();
			const lastId = this.oldChat.at(0)?.id || this.chat.at(0)?.id;
			const lastDate = this.oldChat.at(0)?.createdAt?.toDate() || this.chat.at(0)?.createdAt?.toDate();
			if (!lastDate) return;
			const oldMessages = await this.ai.getChatMessagesPaginated(this.selectedRepo, this.chatId, lastDate, this.messageLimit);

			if (oldMessages.length < (this.messageLimit - 1)) {
				this.maxResultsLoaded = true;
			}

			const timeDiff = new Date().getTime() - now.getTime();
			if (timeDiff <= 2000) {
				await new Promise((resolve) => setTimeout(resolve, 2000 - timeDiff));
			}

			this.oldChat.push(...oldMessages);
			this.oldChat.sort((a, b) => {
				return (a.createdAt?.toDate().getTime() || 0) - (b.createdAt?.toDate().getTime() || 0);
			});

			const oldIdSet = new Set();
			this.oldChat = this.oldChat.filter((m) => {
				if (oldIdSet.has(m.id)) return false;
				oldIdSet.add(m.id);
				return true;
			});

			this.chat = [...this.chat, ...this.oldChat].sort((a, b) => {
				return (a.createdAt?.toDate().getTime() || 0) - (b.createdAt?.toDate().getTime() || 0);
			});

			const newIdSet = new Set();
			this.chat = this.chat.filter((m) => {
				if (newIdSet.has(m.id)) return false;
				newIdSet.add(m.id);
				return true;
			});

			this.document.querySelector(`div[message-id="${lastId}"]`)?.scrollIntoView({ behavior: 'auto' });
			this.chatLoaded = true;
			this.cdRef.markForCheck();
		};
	}

	async createQuery(query: string): Promise<void> {
		if (!query) return console.error('Query is required.');
		if (this.gettingQuery) return console.error('Another query is already running...');
		if (!this.chatId || this.chatId === 'new') {
			const newId = await this.ai.createNewChat(this.selectedRepo);
			await this.router.navigate([`/app/chat/`, this.selectedRepo, newId]);
		}

		const userQuery: AiChatMessage = {
			role: AiChatMessageRole.User,
			content: query.trim(),
			completed: false,
		}

		await this.ai.saveNewMessage(this.selectedRepo, this.chatId, userQuery);

		this.onMessageScroll(true);

		const newMsgIndex = this.chat.length + 1;
		this.gettingQuery = true;
		this.chat = [...this.chat]
		this.cdRef.detectChanges();

		let backupResult = '';
		
		this.ai.createQuery(this.selectedRepo, [...this.chat])
			.pipe(
				catchError((err) => {
					const parsedErr = err.data ? JSON.parse(err.data) : { message: '', debug: undefined };
					this.chat[newMsgIndex] = {
						role: AiChatMessageRole.Assistant,
						content: backupResult,
						completed: true,
						error: {
							debug: parsedErr?.debug || '',
							message: parsedErr?.message || '',
						},
						id: this.chat[newMsgIndex]?.id || '',
						pageSections: this.chat[newMsgIndex]?.pageSections || [],
					};

					this.chat = [...this.chat]
					this.cdRef.detectChanges();
					console.error(parsedErr);
					this.pingStatus();
					return of(undefined);
				}),
				finalize(async () => {
					this.gettingQuery = false;
					this.chat[newMsgIndex] = {
						role: AiChatMessageRole.Assistant,
						content: backupResult,
						completed: true,
						error: this.chat[newMsgIndex]?.error || { },
						id: this.chat[newMsgIndex]?.id || '',
						pageSections: this.chat[newMsgIndex]?.pageSections || [],
					};
					
					this.chat = [...this.chat];
					this.cdRef.detectChanges();

					await this.ai.saveNewMessage(this.selectedRepo, this.chatId, this.chat[newMsgIndex]);
					return of(undefined);
				})
			)
			.subscribe((val) => {
				if (!val) return;
				backupResult = val.completion;

				this.chat[newMsgIndex] = {
					role: AiChatMessageRole.Assistant,
					content: val.completion || '',
					completed: false,
					id: this.chat[newMsgIndex]?.id || '',
					pageSections: this.chat[newMsgIndex]?.pageSections || [],
				};
				
				const pageSections = this.chat[newMsgIndex]?.pageSections;
				if (
					(!pageSections || pageSections.length <= 0) &&
					val.pageSections.length > 0 &&
					this.chat[newMsgIndex]
				) {
					this.chat[newMsgIndex].pageSections = val.pageSections;
				}

				if (val.finishReason) {
					//
				}

				this.onMessageScroll();
				
				this.chat = [...this.chat]
				this.cdRef.detectChanges();
			});
	}

	private async pingStatus(): Promise<void> {
		const s = await this.ai.getStatusPromise();
		this.status = s;
		console.warn('New openai status', this.status);
		this.cdRef.detectChanges();
	}

	private onMessageScroll(bypass = false, animation = true) {
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
					behavior: animation ? 'smooth' : 'instant' as ScrollOptions['behavior'],
				});
				sub.unsubscribe();
			})
    }
  }
}
