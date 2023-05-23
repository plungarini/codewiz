import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {


}
