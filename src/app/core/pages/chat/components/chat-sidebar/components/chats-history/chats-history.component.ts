import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-chats-history',
  templateUrl: './chats-history.component.html',
  styles: [
    `
      :host {
        @apply block mt-4;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatsHistoryComponent {

	@Input() chatHistory: any[] = [];

}
