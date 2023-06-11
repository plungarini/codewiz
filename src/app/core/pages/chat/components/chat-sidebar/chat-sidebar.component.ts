import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
		private router: Router,
		private route: ActivatedRoute,
	) {
		this.$reposChats = this._$selectedRepo.asObservable().pipe(
			switchMap((repo) => this.chatService.getRepoChats(repo))
		)
	}

	updateSelectedDoc(doc: SelectedDocs): void {
		this.selectedDoc = doc;
		this._$selectedRepo.next(doc.id);
		
		if (!this.router.url.includes(`/chat/${doc.id}/`))
			this.router.navigateByUrl(`/app/chat/${doc.id}/new`);
	}

	createNewChat(): void {
		const repo = this.route.snapshot.paramMap.get('repo') || 'angular';
		this.router.navigateByUrl(`/app/chat/${repo}/new`);
	}

}
