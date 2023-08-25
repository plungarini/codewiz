import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-empty-chat-placeholder',
  templateUrl: './empty-chat-placeholder.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyChatPlaceholderComponent {

	/* get isChatEmpty(): boolean {
		return this.chat.filter(m => m.content !== 'init').length <= 0;
	} */

}
