import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
	styles: [`
		:host {
			@apply block pb-44 relative w-full overflow-y-visible overflow-x-hidden px-6;
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

		const hasCompleted = !this.chat[this.chat.length - 1]?.completed && value[value.length - 1]?.completed;
		if (hasCompleted) {
			value[value.length - 1].completed = false;
			setTimeout(() => {
				this.chat[this.chat.length - 1].completed = true;
				this.cdRef.detectChanges();
			}, 500);
		}

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

	trackBy(i: number, obj: AiChatMessage): string {
		return obj?.id || i.toString();
	}

}
