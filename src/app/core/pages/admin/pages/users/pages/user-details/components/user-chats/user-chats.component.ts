import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { AiChatMessage } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AdminUserChatsService } from './services/admin-user-chats.service';

@Component({
  selector: 'app-user-chats',
  templateUrl: './user-chats.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserChatsComponent {

	@Input('uid') set setUid(value: string | undefined) {
		this._uid.next(value);
	}

	private _uid: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

	chats$ = this._uid.pipe(
		switchMap((uid) => {
			if (!uid) return of([]);
			return this.userChats.getAllChats(uid);
		})
	);

	selectedChat$: Observable<AiChatMessage[]> = of([]);
	showChat = '';

	constructor(
		private userChats: AdminUserChatsService,
	) { }

	selectChat(repoId: string, chatId: string, chatName: string) {
		this.showChat = chatName;
		const uid = this._uid.getValue();
		if (!uid) return;
		this.selectedChat$ = this.userChats.getChatMessages(uid, repoId, chatId);
	}

	interpretError(err: AiChatMessage['error']): { code: string, message: string } {
		const defaultMessage = err?.message ?? 'Apologies, but it seems we\'re experiencing some technical difficulties. Please try again in few minutes or reach out to the support.';
		const debug = err?.debug?.message;
		let code = '';
		if (typeof debug !== 'string') {
			code = debug?.data?.['code'] ?? '';
		}
		
		let msg;
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

	trackBy(i: number, item: AiChatMessage) {
		return item.id ?? i;
	}

}
