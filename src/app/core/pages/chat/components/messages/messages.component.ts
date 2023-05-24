import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styles: [
    `
      :host {
        @apply flex-1 overflow-y-auto pb-16;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {

}
