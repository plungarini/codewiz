import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';


@Component({
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
				@apply w-full max-h-full overflow-hidden;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {

	@ViewChild('mainChatContainer', { static: true }) mainChatContainer: ElementRef<HTMLDivElement> | undefined;

	constructor( ) { }
}
