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
	id: number;

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		this.id = new Date().getTime();
	}

	ngAfterViewInit(): void {
		this.startAura();
		this.cdRef.detectChanges();
	}

	startAura(): void {
		const linearGradient = this.linearGradient?.nativeElement;
		const radialGradient = this.radialGradient?.nativeElement;

		if (!linearGradient || !radialGradient || this.role !== this.roles.Assistant || this.animate) return;
		
		this.animate = true;
		linearGradient.children[0].setAttribute('stop-color', this.getRandomAuraColor());
		linearGradient.children[0].classList.add('stop-color-transition');
		linearGradient.children[1].setAttribute('stop-color', this.getRandomAuraColor());
		linearGradient.children[1].classList.add('stop-color-transition');
		linearGradient.children[2].setAttribute('stop-color', this.getRandomAuraColor());
		linearGradient.children[2].classList.add('stop-color-transition');
		radialGradient.children[0].setAttribute('stop-color', this.getRandomAuraColor());
		radialGradient.children[0].classList.add('stop-color-transition');
		radialGradient.children[1].setAttribute('stop-color', this.getRandomAuraColor());
		radialGradient.children[1].classList.add('stop-color-transition');
	}

	private getRandomAuraColor() {
		const colors = ['#3b82f6', '#8B5CF6', '#ec4899', '#f59e0b'];
		return colors[Math.floor(Math.random() * colors.length)];
	}

}
