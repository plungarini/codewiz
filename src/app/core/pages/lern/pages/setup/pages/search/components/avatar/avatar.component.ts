import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AiChatMessageRole } from 'functions/src/models/tiktoken/tiktoken.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {

	@Input() name: string = '';
	@Input() role: AiChatMessageRole = AiChatMessageRole.Assistant;
	@Input() img: string = '';
	@Input() set toggleAnim(value: boolean) {
		this.animate = value;
		this.cdRef.markForCheck();
	}

	roles = AiChatMessageRole;
	animate = true;

	constructor(
		private cdRef: ChangeDetectorRef,
	) { }
	
}
