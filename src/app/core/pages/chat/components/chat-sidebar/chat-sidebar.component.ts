import { ChangeDetectionStrategy, Component } from '@angular/core';
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

	constructor(
		private chatService: AiChatService,
		private router: Router
	) {
		this.$reposChats = this._$selectedRepo.asObservable().pipe(
			switchMap((repo) => this.chatService.getRepoChats(repo))
		)
	}

	selectNewDoc(doc: SelectedDocs): void {
		console.log('Loading new docs...', doc);
		
		this.selectedDoc = doc;
		this._$selectedRepo.next(doc.id);
		
		if (!this.router.url.includes(`/${doc.id}/`))
			this.router.navigateByUrl(`/app/chat/${doc.id}/new`);
	}
}
