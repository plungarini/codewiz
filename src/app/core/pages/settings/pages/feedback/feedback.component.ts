import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { UserFeedback } from './models/feedback.model';
import { FeedbackService } from './services/feedback.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent {

	feedbacks$ = this.feedbacks.getCurrentUserFeedbacks().pipe(
		tap((feedbacks) => {
			const sentToday = feedbacks.filter((feedback) => feedback.createdAt.toDate().toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
			this.disabled = sentToday.length >= this.feedbacks.FEEDBACK_DAY_LIMIT;
			this.cdRef.markForCheck();
		}),
	);

	loading = false;
	disabled = false;

	control = new FormControl('', { validators: [Validators.required], nonNullable: true });

	constructor(
		private feedbacks: FeedbackService,
		private cdRef: ChangeDetectorRef,
	) {	}

	async saveFeedback(): Promise<void> {
		if (!this.control.value) return;
		this.loading = true;
		this.cdRef.markForCheck();
		await this.feedbacks.saveFeedback({
			content: this.control.value,
		});
		this.control.reset();
		this.loading = false;
		this.cdRef.markForCheck();
	}

	trackBy(index: number, feedback: UserFeedback) {
		return feedback.id || index;
	}

}
