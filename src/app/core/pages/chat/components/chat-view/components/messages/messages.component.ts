import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { Repo } from 'src/app/shared/models/repo.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
	styles: [`
		:host {
			@apply block pb-44 relative w-full overflow-y-visible overflow-x-hidden px-6;
		}
	`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {

	@Output() onQueryRefresh = new EventEmitter<{ query: string, queryId: string}>();

	msgRoles = AiChatMessageRole;
	chat: AiChatMessage[] = [];

	show = false;
	copiedAnim: boolean[] = [];
	codeCopied: boolean[] = [];

	repo$: Observable<Repo | undefined>;
	private repoId = new BehaviorSubject('angular');

	@Input('chat') set setChat(value: AiChatMessage[]) {
		if (!value || value?.length < 0) return;

		const hasCompleted = this.chat[this.chat.length - 1]?.completed === false && value[value.length - 1]?.completed;
		if (hasCompleted) {
			value[value.length - 1].completed = false;
			setTimeout(() => {
				this.chat[this.chat.length - 1].completed = true;
				this.cdRef.detectChanges();
			}, 500);
		}

		this.chat = [...value];
		this.cdRef.detectChanges();
	};

	@Input('repoId') set setRepoId(value: string) {
		if (!value) return;
		this.repoId.next(value);
	}

	constructor(
		private db: FirebaseExtendedService,
		private cdRef: ChangeDetectorRef,
		private clipboardService: ClipboardService
	) {
		this.repo$ = this.repoId.pipe(
			switchMap((id) => this.db.getDoc<Repo>(`supported-docs/${id}`))
		)
	}

	onMsgCopyToClipboard(content: string, i: number): void {
		this.clipboardService.copy(content.trim());
		this.copiedAnim[i] = true;
		this.cdRef.detectChanges();
		setTimeout(() => {
			this.copiedAnim[i] = false;
			this.cdRef.detectChanges();
		}, 2000);
	}

	onMsgRefresh(promptId?: string): void {
		if (!promptId) return;
		const prompt = this.chat.find((m) => m.id === promptId);
		if (!prompt) return;
		this.onQueryRefresh.emit({ query: prompt.content, queryId: promptId });
	}

	onCodeCopyToClipboard(i: number): void {
		this.codeCopied[i] = true;
		this.cdRef.detectChanges();
		setTimeout(() => {
			this.codeCopied[i] = false;
			this.cdRef.detectChanges();
		}, 3000);
	}

	togglePageSections(i: number, value: boolean): void {
		this.chat[i].showPageSections = value;
		this.cdRef.detectChanges();
	}

	trackBy(i: number, obj: AiChatMessage): string {
		return obj?.id || i.toString();
	}

	interpretError(err: AiChatMessage['error']): { code: string, message: string } {
		const defaultMessage = err?.message || 'Apologies, but it seems we\'re experiencing some technical difficulties. Please try again in few minutes or reach out to the support.';
		const debug = err?.debug?.message;
		let code = '';
		if (typeof debug !== 'string') {
			code = debug?.data?.['code'] || '';
		}
		
		let msg = defaultMessage;
		switch (code) {
			case 'SUBSCRIPTION_LIMIT_REACHED':
				msg = 'It seems you have reached the limit of questions for your plan. [Upgrade your plan](/app/settings/billing) to continue.';
				break;
			case 'INVALID_REQUEST_DATA':
				msg = defaultMessage;
				break;
			case 'MISSING_UID':
				msg = 'It seems you are not logged in. Please [log in again](/auth/login) to continue.';
				break;
			case 'MISSING_MESSAGES':
				msg = defaultMessage;
				break;
		
			default:
				msg = defaultMessage;
				break;
		}

		return { code, message: msg };
	}

}
