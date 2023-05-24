import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { AiChatMessage, AiChatMessageRole, AiChatRepo } from 'src/app/shared/models/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {

	private selectedRepo: AiChatRepo = AiChatRepo.Angular;
	gettingQuery = false;
	chat: AiChatMessage[] = [];

	constructor(
		private ai: AiChatService,
		private cdRef: ChangeDetectorRef
	) { }


	createQuery(query: string): void {
		if (!query) return console.error('Query is required.');
		console.log('Getting reply from query: ' + query);
		const lastMsgIndex = this.chat.length;
		this.gettingQuery = true;
		this.cdRef.detectChanges();

		this.ai.createQuery(
			this.selectedRepo,
			query
		).pipe(
				catchError((err) => {
					console.error(err);
					return of(undefined);
				}),
				finalize(() => {
					this.gettingQuery = false;
					this.cdRef.detectChanges();
					return of(undefined);
				})
			)
			.subscribe((val) => {
				if (!val) return;
				this.chat[lastMsgIndex] = {
					role: AiChatMessageRole.Assistant,
					content: val,
				};
				this.chat = [...this.chat];
				this.cdRef.detectChanges();
			});
	}

}
