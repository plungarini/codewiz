import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AiChatMessage } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { ChatFeedback } from '../../models/chat-feedback.model';
import { ChatFeedbacksService } from '../../services/chat-feedbacks.service';

@Component({
  selector: 'app-chat-feedbacks',
  templateUrl: './chat-feedbacks.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatFeedbacksComponent {

	feedbacks$ = this.feedbacks.getAll();

	showFeedback$ = new BehaviorSubject<ChatFeedback | undefined>(undefined);

	constructor(
		private feedbacks: ChatFeedbacksService,
	) { }

	showFeedback(feedback: ChatFeedback | undefined) {
		this.showFeedback$.next(feedback);
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

}
