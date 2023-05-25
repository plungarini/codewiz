import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';
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
		private cdRef: ChangeDetectorRef,
		private markdownService: MarkdownService,
	) {
		this.markdownService.renderer.code = (code, lang, isEscaped) => {
			return ``
		}
	}

	/* 
		this.markdownService.renderer.heading = (text: string, level: number) => {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
      return '<h' + level + '>' +
               '<a name="' + escapedText + '" class="anchor" href="#' + escapedText + '">' +
                 '<span class="header-link"></span>' +
               '</a>' + text +
             '</h' + level + '>';
    };
	*/

	chat: AiChatMessage[] = [];

	onCopyToClipboard(event: any): void {
		console.log('Copied', event)
	}

}
