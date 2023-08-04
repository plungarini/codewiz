import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
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

}
