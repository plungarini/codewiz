import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-lern-feedbacks',
  templateUrl: './lern-feedbacks.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LernFeedbacksComponent {

}
