import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-app-feedbacks',
  templateUrl: './app-feedbacks.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFeedbacksComponent {

}
