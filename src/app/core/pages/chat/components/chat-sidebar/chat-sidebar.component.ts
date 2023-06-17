import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, switchMap } from 'rxjs';
import { SelectedDocs } from 'src/app/shared/models/select-docs.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

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
export class ChatSidebarComponent {

	$reposChats: Observable<unknown[]>;
	selectedDoc: SelectedDocs | undefined;

	private _$selectedRepo = new Subject<string>();

	private chatService = inject(AiChatService);
	private router = inject(Router);
	private cdRef = inject(ChangeDetectorRef);

	constructor( ) {
		this.$reposChats = this._$selectedRepo.asObservable().pipe(
			switchMap((repo) => this.chatService.getRepoChats(repo))
		)
	}

	thisDate = () => Date.now();

	updateSelectedDoc(doc: SelectedDocs): void {
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
