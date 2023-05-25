import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import hljs from 'highlight.js';
import { MarkdownService } from 'ngx-markdown';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
	styles: [`
		:host {
			@apply block overflow-hidden pb-16 pt-2 max-h-full overflow-y-auto;
		}
	`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {

	@Input('chat') set setChat(value: AiChatMessage[]) {
		if (!value || value?.length < 0) return;
		this.chat = value;
		this.cdRef.detectChanges();
	};

	msgRoles = AiChatMessageRole;

	constructor(
		private cdRef: ChangeDetectorRef,
		private markdownService: MarkdownService,
	) {
		this.markdownService.renderer.code = (code, lang, isEscaped) => {
			const highlighted = hljs.highlightAuto(code).value;
			const klass = lang ? `${lang} ` : '';
			return `<pre><code class="hljs !bg-zinc-950 ${klass}rounded-md my-2 break-words min-w-full whitespace-pre-wrap flex w-full max-w-full">${highlighted}</code></pre>`;
		}
		this.markdownService.renderer.codespan = (code) => {
			const highlighted = hljs.highlightAuto(code).value;
			return `<code class="hljs !bg-zinc-950 rounded-md break-words whitespace-pre-wrap inline-flex max-w-full">${highlighted}</code>`;
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
