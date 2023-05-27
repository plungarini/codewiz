import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import hljs from 'highlight.js';
import { MarkdownService } from 'ngx-markdown';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { codeBlockAndHeader, codeBlockPlain, codespan } from './md-blocks/index.md';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
	styles: [`
		:host {
			@apply block pb-44 relative w-full overflow-y-visible;
		}
	`],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MessagesComponent {

	msgRoles = AiChatMessageRole;
	chat: AiChatMessage[] = [];

	show = false;

	@Input('chat') set setChat(value: AiChatMessage[]) {
		if (!value || value?.length < 0) return;
		this.chat = value;
	};

	constructor(
		private markdownService: MarkdownService,
	) {
		this.markdownService.renderer.code = (code, lang, isEscaped) => {
			const highlighted = hljs.highlightAuto(code, lang ? [lang] : []).value;
			if (!lang) {
				return codeBlockPlain(highlighted);
			}
			return codeBlockAndHeader(lang, highlighted);
		}
		this.markdownService.renderer.codespan = (code) => {
			const highlighted = hljs.highlightAuto(code).value;
			return codespan(highlighted);
		}
		this.markdownService.renderer.paragraph = (text) => {
			return `<p class="mt-4 first-of-type:mt-0 whitespace-pre-wrap">${text}</p>`;
		}
	}

	onCopyToClipboard(event: MouseEvent): void {
		console.log('Copied', event)
	}

}
