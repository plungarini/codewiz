import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-message-toolbar',
  templateUrl: './message-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageToolbarComponent {

	@Input() role: AiChatMessageRole = AiChatMessageRole.User;
	
	@Output() onCopy = new EventEmitter();

	copyToClipboard(): void {
		this.onCopy.emit();
	}

}
