import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatStatusIndicator, ClientOpenaiStatus } from 'src/app/shared/models/ai-chat/ai-chat-status.model';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styles: [
    `
      :host {
        @apply absolute top-4 left-0 w-full z-[9999];
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

	@Input('status') set setStatus(value: ClientOpenaiStatus) {
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

	private defaultStatus: ClientOpenaiStatus = {
		title: 'OpenAI\'s APIs are online',
		message: '',
		link: 'https://status.openai.com/',
		indicator: AiChatStatusIndicator.None,
	}

	status: ClientOpenaiStatus;

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		this.status = this.defaultStatus;
	}

}
