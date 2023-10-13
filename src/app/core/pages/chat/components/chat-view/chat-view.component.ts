import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
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
        @apply md:relative w-full max-h-full md:overflow-hidden;
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
	showMobileMenu = false;

	private oldChat: AiChatMessage[] = [];
	private maxResultsLoaded = false;
	private messageLimit = 10;

	showScrollToBottom = false;
	
	status: ClientOpenaiStatus = {
		title: 'OpenAI\'s APIs are online',
		message: '',
		link: 'https://status.openai.com/',
		indicator: AiChatStatusIndicator.None,
	}
	
	selectedRepo: string = 'angular';
	chatLoaded = false;

	private _statusSub: Subscription;
	private _chatSub: Subscription;
	private _chatId: string = '';

	constructor(
		private ai: AiChatService,
		private cdRef: ChangeDetectorRef,
		private route: ActivatedRoute,
		private router: Router,
		@Inject(DOCUMENT) private document: Document,
	) {
		this._statusSub = this.ai.getStatus().subscribe((s) => {
			this.status = s;
			console.warn('New openai status', this.status);
			this.cdRef.markForCheck();
		});
		this._chatSub = this.route.paramMap
			.pipe(
				switchMap((params) => {
					const repo = params.get('repo');
					const id = params.get('id');

					if (repo) {
						this.selectedRepo = repo;
					}

					if (id && id !== this._chatId) {
						this._chatId = id;
						this.chatLoaded = false;
						this.maxResultsLoaded = false;
						this.oldChat = [];
						this.cdRef.markForCheck();
					}
					
					if (!id || !repo) {
						this.oldChat = [];
						this.router.navigateByUrl(`/app/chat/${repo ?? 'angular'}/new`);
						this.chatLoaded = false;
						return of([])
					};

					return this.ai.getChatMessages(repo, id, this.messageLimit);
				}),
		).subscribe((messages) => {
			this.chat = [...messages, ...this.oldChat].sort((a, b) => {
				return (a.createdAt?.toDate().getTime() ?? 0) - (b.createdAt?.toDate().getTime() ?? 0);
			});
			this.cdRef.markForCheck();
			
			if (this.chat.length <= 0) {
				const repo = this.route.snapshot.paramMap.get('repo');
				this.router.navigateByUrl(`/app/chat/${repo ?? 'angular'}/new`);
				this.cdRef.markForCheck();
			}

			if (this.chat.length <= (this.messageLimit - 1)) {
				this.maxResultsLoaded = true;
			}

			if (!this.chatLoaded) {
				this.chatLoaded = true;
				this.onMessageScroll(true, false);
				this.onChatScroll();
				this.cdRef.markForCheck();
			};

		});
	}

	ngOnDestroy(): void {
		this._statusSub.unsubscribe();
		this._chatSub.unsubscribe();
	}

	get isChatEmpty(): boolean {
		return this.chat.filter(m => m.content !== 'init').length <= 0;
	}

	async onChatScroll(event?: any): Promise<void> {
		const element = this.mainChatContainer?.nativeElement;
		if (!element) return;
		
		const scrolledToTop = element.scrollTop <= 0;
		const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight;
		if (!isScrolledToBottom && !this.showScrollToBottom) {
			this.showScrollToBottom = true;
			this.cdRef.markForCheck();
		} else if ((isScrolledToBottom || this.chat.length <= 2) || (isScrolledToBottom && this.showScrollToBottom)) {
			this.showScrollToBottom = false;
			this.cdRef.markForCheck();
		}

		if (scrolledToTop && !isScrolledToBottom && this.chat.length >= (this.messageLimit - 1) && !this.maxResultsLoaded) {
			console.warn('Loading more messages...');
			const now = new Date();
			this.chatLoaded = false;
			this.cdRef.markForCheck();
			const lastId = this.oldChat.at(0)?.id ?? this.chat.at(0)?.id;
			const lastDate = this.oldChat.at(0)?.createdAt?.toDate() ?? this.chat.at(0)?.createdAt?.toDate();
			if (!lastDate) return;
			const oldMessages = await this.ai.getChatMessagesPaginated(this.selectedRepo, this._chatId, lastDate, this.messageLimit);

			if (oldMessages.length < (this.messageLimit - 1)) {
				this.maxResultsLoaded = true;
			}

			const timeDiff = new Date().getTime() - now.getTime();
			if (timeDiff <= 2000) {
				await new Promise((resolve) => setTimeout(resolve, 2000 - timeDiff));
			}

			this.oldChat.push(...oldMessages);
			this.oldChat.sort((a, b) => {
				return (a.createdAt?.toDate().getTime() ?? 0) - (b.createdAt?.toDate().getTime() ?? 0);
			});

			const oldIdSet = new Set();
			this.oldChat = this.oldChat.filter((m) => {
				if (oldIdSet.has(m.id)) return false;
				oldIdSet.add(m.id);
				return true;
			});

			this.chat = [...this.chat, ...this.oldChat].sort((a, b) => {
				return (a.createdAt?.toDate().getTime() ?? 0) - (b.createdAt?.toDate().getTime() ?? 0);
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

	private async deleteNextMessages(fromId: string): Promise<void> {
		const msgIndex = this.chat.findIndex((m) => m.id === fromId);
		const messagesToDelete = this.chat.slice(msgIndex + 1).map((m) => m.id).filter((id) => !!id) as string[];
		await this.ai.deleteMultipleMessages(this.selectedRepo, this._chatId, messagesToDelete);
	}

	async createQuery(query: string, refreshQueryId?: string): Promise<void> {
		if (!query) return console.error('Query is required.');
		if (this.gettingQuery) return console.error('Another query is already running...');

		let newChatId = this._chatId;
		if (!newChatId || newChatId === 'new') {
			newChatId = await this.ai.createNewChat(this.selectedRepo);
			await this.router.navigate([`/app/chat/`, this.selectedRepo, newChatId]);
		}

		this.gettingQuery = true;
		this.cdRef.markForCheck();

		if (refreshQueryId) {
			await this.deleteNextMessages(refreshQueryId);
		} else {
			const userQuery: AiChatMessage = {
				chatId: newChatId,
				repoId: this.selectedRepo,
				role: AiChatMessageRole.User,
				content: query.trim(),
				completed: true,
			}
	
			await this.ai.saveNewMessage(this.selectedRepo, this._chatId, userQuery);
		}

		this.onMessageScroll(true);

		const assistantId = this.ai.getNewRandomId();
		const assistantQuery: AiChatMessage = {
			id: assistantId,
			chatId: newChatId,
			repoId: this.selectedRepo,
			role: AiChatMessageRole.Assistant,
			content: '',
			completed: false,
		}

		await this.ai.saveNewMessage(this.selectedRepo, this._chatId, assistantQuery, true);

		this.chat = [...this.chat];

		this.onMessageScroll(true);
		this.cdRef.markForCheck();

		let backupResult: AiChatMessage = assistantQuery;
		
		this.ai.createQuery(this.selectedRepo, [...this.chat])
			.pipe(
				catchError((err) => {
					const parsedErr = err || { message: '', debug: undefined };
					const savedMessage = this.getFromLocalStorage(assistantId);
					const msgRef = savedMessage ?? backupResult;
					const msgRefIndex = this.chat.findIndex(m => m.id === assistantId);

					const queryRes: AiChatMessage = {
						role: AiChatMessageRole.Assistant,
						content: backupResult.content,
						completed: true,
						id: msgRef?.id ?? '',
						chatId: msgRef?.chatId ?? '',
						repoId: msgRef?.repoId ?? '',
						pageSections: msgRef?.pageSections ?? [],
						error: parsedErr,
					}

					backupResult = queryRes;

					if (msgRefIndex >= 0) {
						this.chat[msgRefIndex] = queryRes;
						this.chat = [...this.chat];
						this.cdRef.markForCheck();
					} else {
						this.saveToLocalStorage(queryRes);
					}

					console.error('Error while getting query', parsedErr);
					this.pingStatus();
					return of(undefined);
				}),
				finalize(() => {
					this.gettingQuery = false;
					const savedMessage = this.getFromLocalStorage(assistantId);
					const msgRef = savedMessage ?? backupResult;
					const msgRefIndex = this.chat.findIndex(m => m.id === assistantId);

					const queryRes: AiChatMessage = {
						role: AiChatMessageRole.Assistant,
						content: backupResult.content,
						completed: true,
						error: msgRef?.error ?? { },
						id: msgRef?.id ?? '',
						chatId: msgRef?.chatId ?? '',
						repoId: msgRef?.repoId ?? '',
						pageSections: msgRef?.pageSections ?? [],
					}

					if (msgRefIndex >= 0) {
						this.chat[msgRefIndex] = queryRes;
						this.chat = [...this.chat];
						this.cdRef.markForCheck();
					}
					
					this.ai.saveNewMessage(queryRes.repoId, queryRes.chatId, queryRes);
				})
			)
			.subscribe((val) => {
				if (!val) return;
				const savedMessage = this.getFromLocalStorage(assistantId);
				const msgRef = savedMessage ?? backupResult;
				const msgRefIndex = this.chat.findIndex(m => m.id === assistantId);

				const queryRes: AiChatMessage = {
					role: AiChatMessageRole.Assistant,
					content: val.completion ?? '',
					completed: false,
					error: msgRef?.error ?? { },
					id: msgRef?.id ?? '',
					chatId: msgRef?.chatId ?? '',
					repoId: msgRef?.repoId ?? '',
					pageSections: msgRef?.pageSections ?? [],
				}

				backupResult = queryRes;
				
				const pageSections = msgRef?.pageSections;
				if (
					(!pageSections || pageSections.length <= 0) &&
					val.pageSections.length > 0
				) {
					queryRes.pageSections = val.pageSections;
				}

				if (val.finishReason) {
					queryRes.finishReason = val.finishReason;
				}
				
				if (msgRefIndex >= 0) {
					this.chat[msgRefIndex] = queryRes;
					this.chat = [...this.chat];
					this.cdRef.markForCheck();
					this.onMessageScroll();
				} else {
					this.saveToLocalStorage(queryRes);
				}
			});
	}

	onMessageScroll(bypass = false, animation = true) {
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
	
	toggleMobileMenu(value: boolean) {
		this.showMobileMenu = value;
		this.cdRef.markForCheck();
	}

	private async pingStatus(): Promise<void> {
		const s = await this.ai.getStatusPromise();
		this.status = s;
		console.warn('New openai status', this.status);
		this.cdRef.markForCheck();
	}

	private saveToLocalStorage(message: AiChatMessage): void {
		const existing = JSON.parse(localStorage.getItem('wizchat_local') ?? '[]') as AiChatMessage[];
		existing.push({ ...message, createdAt: Timestamp.fromDate(new Date()) });
		localStorage.setItem('wizchat_local', JSON.stringify(existing));
	}

	private getFromLocalStorage(messageId: string): AiChatMessage | undefined {
		const existing = JSON.parse(localStorage.getItem('wizchat_local') ?? '[]') as AiChatMessage[];
		const index = existing.findIndex((m) => m.id === messageId);
		const res = index >= 0 ? existing[index] : undefined;
		if (res) this.deleteFromLocalStorage(messageId);
		return res;
	}

	private deleteFromLocalStorage(messageId: string): void {
		const existing = JSON.parse(localStorage.getItem('wizchat_local') ?? '[]') as AiChatMessage[];
		const index = existing.findIndex((m) => m.id === messageId);
		if (index >= 0) {
			existing.splice(index, 1);
			localStorage.setItem('wizchat_local', JSON.stringify(existing));
		}
	}
}
