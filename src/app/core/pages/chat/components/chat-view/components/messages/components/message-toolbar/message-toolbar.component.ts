import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-message-toolbar',
  templateUrl: './message-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageToolbarComponent {

	@Input() role: AiChatMessageRole = AiChatMessageRole.User;
	@Input() showCopyBtn = false;
	@Input() showShareBtn = false;
	@Input() showRetryBtn = false;
	
	@Output() onCopy = new EventEmitter();
	@Output() onRefresh = new EventEmitter();

	copyToClipboard(): void {
		this.onCopy.emit();
	}

	refreshQuery(): void {
		this.onRefresh.emit();
	}

}
