import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styles: [
    `
      :host {
      	@apply block w-full h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbacksComponent {

}
