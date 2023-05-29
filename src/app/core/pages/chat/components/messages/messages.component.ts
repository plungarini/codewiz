import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Renderer2 } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';
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
		private markdownService: MarkdownService,
		private cdRef: ChangeDetectorRef,
		private renderer: Renderer2
	) {
		this.markdownService.renderer.html = (html) => {
			const p = this.renderer.createElement('p') as HTMLParagraphElement;
			p.innerText = html;
			return p.outerHTML;
		}
	}

	onCopyToClipboard(event: MouseEvent): void {
		console.log('Copied', event)
	}

	togglePageSections(i: number, value: boolean): void {
		this.chat[i].showPageSections = value;
		this.cdRef.detectChanges();
	}

}
