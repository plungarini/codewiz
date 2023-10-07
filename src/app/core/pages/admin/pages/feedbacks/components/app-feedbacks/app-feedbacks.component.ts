import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppFeedback } from '../../models/app-feedback.model';
import { AppFeedbacksService } from '../../services/app-feedbacks.service';

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

	feedbacks$ = this.feedbacks.getAll();

	showFeedback$ = new BehaviorSubject<AppFeedback | undefined>(undefined);

	constructor(
		private feedbacks: AppFeedbacksService,
	) { }

	showFeedback(feedback: AppFeedback | undefined) {
		this.showFeedback$.next(feedback);
	}

}
