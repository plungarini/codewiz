import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import hljs from 'highlight.js';
import { MarkdownService } from 'ngx-markdown';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
	styles: [`
		:host {
			@apply block overflow-hidden pb-16 pt-2 max-h-full overflow-y-auto relative;
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
			const highlighted = hljs.highlightAuto(code, lang ? [lang] : []).value;
			const klass = lang ? `${lang} ` : '';
			return `
				<div class="w-full my-3">
					<div class="w-full px-2.5 py-2 bg-zinc-700 rounded-t-md">
						<p class="text-zinc-300 -mt-[0.2rem] text-sm">${lang || 'Code Snippet'}</p>
					</div>
					<pre><code class="hljs ${klass} !bg-zinc-950 rounded-b-md break-words min-w-full whitespace-pre-wrap flex w-full max-w-full">${highlighted}</code></pre>
				</div>
			`;
		}
		this.markdownService.renderer.codespan = (code) => {
			const highlighted = hljs.highlightAuto(code).value;
			return `<code class="hljs !bg-zinc-950 rounded-md break-words whitespace-pre-wrap inline-flex max-w-full">${highlighted}</code>`;
		}
	}

	chat: AiChatMessage[] = [];

	onCopyToClipboard(event: MouseEvent): void {
		console.log('Copied', event)
	}

}
