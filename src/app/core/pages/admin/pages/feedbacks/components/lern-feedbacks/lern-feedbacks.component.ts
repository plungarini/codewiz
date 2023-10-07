import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LernFeedback } from '../../models/lern-feedback.model';
import { LernFeedbacksService } from '../../services/lern-feedbacks.service';

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

	feedbacks$: Observable<LernFeedback[]> = this.lernFeedbacks.getAll();

	showFeedback$ = new BehaviorSubject<LernFeedback | undefined>(undefined);

	constructor(
		private lernFeedbacks: LernFeedbacksService,
	) { }

	showFeedback(feedback: LernFeedback | undefined) {
		this.showFeedback$.next(feedback);
	}

}
