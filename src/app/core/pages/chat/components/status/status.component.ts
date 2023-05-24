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
        @apply w-fit max-w-md mx-auto px-6 pointer-events-none pt-6;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {
	private previousIndicator: AiChatStatusIndicator = AiChatStatusIndicator.None;
	indicators = AiChatStatusIndicator;
	show = false;
	hideDelay = 5000;

	@Input('status') set setStatus(value: ClientStatus) {
		if (!value) return;
		this.status = value;

		const isSameIndicator = this.status.indicator === this.previousIndicator;
		const isOperational = this.status.indicator === AiChatStatusIndicator.None;
		if (isOperational && !isSameIndicator) {
			setTimeout(() => {
				this.show = false;
				this.cdRef.detectChanges();
			}, this.hideDelay);
		}

		if (!isSameIndicator && !this.show) {
			this.show = true;
		}

		this.previousIndicator = this.status.indicator;
		this.cdRef.detectChanges();
	}

	private defaultStatus: ClientStatus = {
		title: 'OpenAI\'s APIs are online',
		message: '',
		link: 'https://status.openai.com/',
		indicator: AiChatStatusIndicator.None,
	}

	status: ClientStatus;

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		this.status = this.defaultStatus;
	}

}
