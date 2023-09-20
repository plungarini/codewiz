import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';
import { AiChatService } from 'src/app/shared/services/ai-chat.service';

@Component({
  selector: 'app-ai-toolbar',
  templateUrl: './ai-toolbar.component.html',
  styles: [
    `
      :host {
        display: block;
				position: relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiToolbarComponent {

	@Input('msg') set setMsg(value: AiChatMessage | undefined) {
		if (!value) return;
		const urls = new Set();
		value.pageSections?.map((p) => {
			const numberIdRegex = /^(.*?)(?:\[\d+\])?$/;
			const match = p.id.match(numberIdRegex);
			p.id = match ? match[1] : p.id;
			return p;
		})
		this.msg = {
			...value,
			pageSections: value.pageSections?.filter(section => {
        if (!urls.has(section.id)) {
            urls.add(section.id);
            return true;
        }
        return false;
			}),
		};
		this.cdRef.detectChanges();
	};
	@Input() show: boolean = false;
	@Input() containerWidth: number = 0;

	@Output() onShowPageSections = new EventEmitter();

	constructor(
		private cdRef: ChangeDetectorRef,
		private aiChatService: AiChatService,
	) { }

	msg: AiChatMessage = {
		completed: true,
		content: '',
		role: AiChatMessageRole.User,
	};

	showPageSections(): void {
		this.onShowPageSections.emit();
	}

	async feedbackMessage(status: 'like' | 'dislike'): Promise<void> {
		const normStatus = this.msg.feedback === status ? 'none' : status;
		await this.aiChatService.updateMessageFeedback({
			...this.msg,
			feedback: normStatus,
		})
	}
	
}
