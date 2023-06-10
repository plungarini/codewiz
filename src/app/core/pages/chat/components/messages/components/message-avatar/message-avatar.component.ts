import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AiChatMessageRole } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
	selector: 'app-message-avatar',
	templateUrl: './message-avatar.component.html',
	styleUrls: ['./message-avatar.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class MessageAvatarComponent implements AfterViewInit {

	@ViewChild('radialGradient') radialGradient: ElementRef | undefined;
	@ViewChild('linearGradient') linearGradient: ElementRef | undefined;
	
	@Input() name: string = '';
	@Input() role: AiChatMessageRole = AiChatMessageRole.Assistant;
	@Input() img: string = '';
	@Input() set stopAnim(value: boolean) {
		if (!value) return;
		this.animate = false;
		this.cdRef.detectChanges();
	}

	roles = AiChatMessageRole;
	animate = true;

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
	}

	ngAfterViewInit(): void {
		this.startAura();
	}

	startAura(): void {
		this.animate = true;
		this.cdRef.detectChanges();
	}

}
