import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, switchMap, tap } from 'rxjs';
import { AiUserRepoChat } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';
import { Repo } from '../../../../../shared/models/repo.model';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styles: [
    `
      :host {
        display: block;
				height: 100%;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatSidebarComponent implements OnDestroy {

	private _$selectedRepo = new BehaviorSubject<string>('angular');
	private routerSub: Subscription;
	private reposChats: AiUserRepoChat[] = [];

	$reposChats = this._$selectedRepo.asObservable().pipe(
		switchMap((repo) => this.chatService.getRepoChats(repo)),
		tap((chats) => {
			this.reposChats = chats;
			const url = this.router.url;
			const name = this.reposChats.find((c) => url.includes(c.id))?.name || 'WizChat';
			this.meta.update({
				title: `CodeWiz | ${name}`,
			})
		}),
	);
	selectedDoc: Repo | undefined;

	constructor(
		private chatService: AiChatService,
		private router: Router,
		private cdRef: ChangeDetectorRef,
		private meta: PersonalMetaTagsService,
	) {
		this.routerSub = this.router.events.subscribe(() => {
			const url = this.router.url;
			const name = this.reposChats.find((c) => url.includes(c.id))?.name || 'WizChat';
			this.meta.update({
				title: `CodeWiz | ${name}`,
			});
		})
	}
	
	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
	}

	thisDate = () => Date.now();

	startNewChat(): void {
		this.router.navigateByUrl(`/app/chat/${this.selectedDoc?.id || 'angular'}/new`, { onSameUrlNavigation: 'reload' });
		this.cdRef.detectChanges();
	}

	updateSelectedDoc(doc: Repo): void {
		this.selectedDoc = doc;
		this._$selectedRepo.next(doc.id);
		
		if (!this.router.url.includes(`/chat/${doc.id}/`)) {
			this.router.navigateByUrl(`/app/chat/${doc.id}/new`);
			this.cdRef.markForCheck();
		}
		this.cdRef.markForCheck();
	}

	async deleteChat(opt: { repo: string; id: string }): Promise<void> {
		if (!opt) return console.error('Error on deleting chat, chat details are not defined', opt);
		await this.chatService.deleteChat(opt.repo, opt.id);
	}

}
