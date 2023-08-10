import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AiUserRepoChat } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  selector: 'app-latest-chats',
  templateUrl: './latest-chats.component.html',
  styles: [
    `
      :host {
        @apply block h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestChatsComponent {

	chats$: Observable<AiUserRepoChat[]> = this.ai.getAllUserChats(new Date().getMonth());

	constructor(
		private ai: AiChatService,
	) { }

	getTimeDifference(date: Date): string {
		const currentTime = new Date();
		const diffInMinutes = Math.floor((currentTime.getTime() - date.getTime()) / (1000 * 60));
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInMinutes < 1) {
			return 'just now';
		} else if (diffInMinutes < 60) {
			return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
		} else if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
		} else {
			return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
		}
	}

	trackBy(i: number, item: AiUserRepoChat): string {
		return item.id || i;
	}

}
