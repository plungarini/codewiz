import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
	selector: 'app-message-avatar',
	templateUrl: './message-avatar.component.html',
	styles: [
		`
      :host {
        display: block;
			}
		`
	],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageAvatarComponent {

	@Input() name: string = '';
	@Input() role: AiChatMessageRole = AiChatMessageRole.User;
	@Input() img: string = '';

	roles = AiChatMessageRole;

	constructor(

	) { }

}
