import { ChangeDetectionStrategy, Component } from '@angular/core';


@Component({
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
				@apply w-full max-h-screen sm:max-h-full overflow-hidden;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {

	constructor() { }
	
}
