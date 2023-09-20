import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
	selector: 'app-message-avatar',
	templateUrl: './message-avatar.component.html',
	styleUrls: ['./message-avatar.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class MessageAvatarComponent {
	
	@Input() name: string = '';
	@Input() role: AiChatMessageRole = AiChatMessageRole.Assistant;
	@Input() img: string = '';
	@Input() set stopAnim(value: boolean) {
		if (!value) return;
		this.animate = false;
		this.cdRef.detectChanges();
	}

	roles = AiChatMessageRole;
	animate = true;

	constructor(
		private cdRef: ChangeDetectorRef,
	) { }

}
