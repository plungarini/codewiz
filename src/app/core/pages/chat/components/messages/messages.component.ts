import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatMessage } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styles: [
    `
      :host {
        @apply flex-1 overflow-y-auto pb-16 pt-2 ml-4;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {

	@Input('chat') set setChat(value: AiChatMessage[]) {
		if (!value || value?.length < 0) return;
		this.chat = value;
		this.cdRef.detectChanges();
	};

	constructor(
		private cdRef: ChangeDetectorRef
	) { }

	chat: AiChatMessage[] = [];

}
