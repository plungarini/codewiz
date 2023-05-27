import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Renderer2 } from '@angular/core';
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
		private renderer: Renderer2
	) {
		this.markdownService.renderer.code = (code, lang, isEscaped) => {
			const highlighted = hljs.highlightAuto(code, lang ? [lang] : []).value;
			const klass = lang ? `${lang} ` : '';

			if (!lang) {
				return codeBlockPlain(klass, highlighted);
			}

			return codeBlockAndHeader(lang, klass, highlighted);
		}
		this.markdownService.renderer.codespan = (code) => {
			const highlighted = hljs.highlightAuto(code).value;
			return codespan(highlighted);
		}
		this.markdownService.renderer.paragraph = (text) => {
			return `<p class="mt-4 first-of-type:mt-0 whitespace-pre-wrap">${text}</p>`;
		}
		this.markdownService.renderer.text = (string) => {
			const textNode = this.renderer.createText(string);
  		return textNode.textContent;
		}
	}

	chat: AiChatMessage[] = [];

	onCopyToClipboard(event: MouseEvent): void {
		console.log('Copied', event)
	}

}
