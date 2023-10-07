import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-feedbacks',
  templateUrl: './chat-feedbacks.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatFeedbacksComponent {

}
