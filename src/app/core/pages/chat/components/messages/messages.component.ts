import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
	styles: [`
		:host {
			@apply block pb-44 relative w-full overflow-y-visible;
		}
	`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {

	msgRoles = AiChatMessageRole;
	chat: AiChatMessage[] = [];

	show = false;

	@Input('chat') set setChat(value: AiChatMessage[]) {
		if (!value || value?.length < 0) return;
		this.chat = [...value];
		this.cdRef.detectChanges();
	};

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		
	}

	onCopyToClipboard(event: MouseEvent): void {
		console.log('Copied', event)
	}

	togglePageSections(i: number, value: boolean): void {
		this.chat[i].showPageSections = value;
		this.cdRef.detectChanges();
	}

}
