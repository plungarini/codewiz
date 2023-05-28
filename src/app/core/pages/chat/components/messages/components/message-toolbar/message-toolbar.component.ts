import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { AiChatMessage, AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-message-toolbar',
  templateUrl: './message-toolbar.component.html',
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
export class MessageToolbarComponent {

	@Input('msg') set setMsg(value: AiChatMessage | undefined) {
		if (!value) return;
		this.msg = value;
		this.cdRef.detectChanges();
	};
	@Input() show: boolean = false;

	@Output() onShowPageSections = new EventEmitter();

	constructor(
		private cdRef: ChangeDetectorRef,
	) { }

	msg: AiChatMessage = {
		completed: true,
		content: '',
		role: AiChatMessageRole.User,
	};

	showPageSections(): void {
		this.onShowPageSections.emit();
	}
	
}
