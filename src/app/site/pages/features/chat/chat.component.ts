import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
        display: block;
      }

			.mask-image {
				-webkit-mask-image: linear-gradient(to top, transparent, rgba(0,0,0,0.5), rgba(0,0,0,0.5), rgba(0,0,0,0.8), black);
				mask-image: linear-gradient(to top, transparent, rgba(0,0,0,0.5), rgba(0,0,0,0.5), rgba(0,0,0,0.8), black);
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {

}
