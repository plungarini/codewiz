import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatStatusIndicator } from 'src/app/shared/models/ai-chat/ai-chat-status.model';


type ClientStatus = {
	title: string,
	message: string,
	link: string,
	indicator: AiChatStatusIndicator,
}

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styles: [
    `
      :host {
        @apply w-full max-w-md mx-auto px-6 pointer-events-none;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {
	private previousIndicator: AiChatStatusIndicator = AiChatStatusIndicator.None;

	@Input() setStatus(value: ClientStatus) {
		if (!value) return;
		this.status = value;
		this.cdRef.detectChanges();
	}

	private defaultStatus: ClientStatus = {
		title: 'OpenAI\'s API are operational',
		message: '',
		link: 'https://status.openai.com/',
		indicator: AiChatStatusIndicator.None,
	}

	status: ClientStatus;

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		this.status = this.defaultStatus;
		this.cdRef.detectChanges();
	}

}
