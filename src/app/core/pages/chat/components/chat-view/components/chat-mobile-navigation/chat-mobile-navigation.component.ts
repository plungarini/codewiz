import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Repo } from 'src/app/shared/models/repo.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  selector: 'app-chat-mobile-navigation',
  templateUrl: './chat-mobile-navigation.component.html',
  styles: [
    `
      :host {
        @apply left-0 w-full max-w-full fixed bottom-0 z-[80] pointer-events-none flex flex-col md:hidden;
      }
    `
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMobileNavigationComponent {

	@Output() onHideMobileMenu = new EventEmitter<void>();
	show = true;
	private _$selectedRepo = new BehaviorSubject<string>('angular');
	
	$reposChats = this._$selectedRepo.asObservable().pipe(
		switchMap((repo) => this.chatService.getRepoChats(repo))
	);
	selectedDoc: Repo | undefined;


	constructor(
		private chatService: AiChatService,
		private router: Router,
		private cdRef: ChangeDetectorRef,
	) { }

	thisDate = () => Date.now();

	startNewChat(): void {
		this.router.navigateByUrl(`/app/chat/${this.selectedDoc?.id || 'angular'}/new`, { onSameUrlNavigation: 'reload' });
		setTimeout(() => {
			this.closeMobileMenu();
		}, 300);
		this.cdRef.markForCheck();
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

	closeMobileMenu(): void {
		this.onHideMobileMenu.emit();
	}

}
