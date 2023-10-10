import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { LernFeedbackService } from '../../services/lern-feedback.service';

@Component({
  selector: 'app-section-completed',
  templateUrl: './section-completed.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionCompletedComponent implements OnDestroy {

	@Input('courseId') set setCourseId(value: string | undefined) {
		this.courseId$.next(value);
		this.courseId = value;
	};

	feedback = new FormGroup({
		reaction: new FormControl<'bad' | 'good' | 'great' | undefined>(undefined, { nonNullable: true, validators: Validators.required, updateOn: 'blur' }),
		comment: new FormControl('', { nonNullable: true, validators: Validators.required, updateOn: 'blur' }),
	});

	saved = false;

	private courseId: string | undefined;
	private courseId$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

	private _formSub: Subscription;
	private _feedbackSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private lernFeedback: LernFeedbackService,
	) {
		this._formSub = this.feedback.valueChanges.subscribe((value) => {
			this.save(value);
		});
		this._feedbackSub = this.courseId$.pipe(
			switchMap((courseId) => {
				return this.lernFeedback.getFeedback(courseId);
			})
		).subscribe((value) => {
			this.feedback.patchValue({
				reaction: value?.reaction,
				comment: value?.comment,
			}, { emitEvent: false });
			this.cdRef.markForCheck();
		})
	}

	ngOnDestroy(): void {
		this._formSub.unsubscribe();
		this._feedbackSub.unsubscribe();
	}

	async save(
		value: Partial<{
			reaction: "bad" | "good" | "great" | undefined;
			comment: string;
		}>
	) {
		if (!this.courseId) return;
		await this.lernFeedback.setFeedback(this.courseId, value);
		this.saved = true;
		this.cdRef.markForCheck();
		setTimeout(() => {
			this.saved = false;
			this.cdRef.markForCheck();
		}, 3000);
	}

	setReaction(value: 'bad' | 'good' | 'great'): void {
		this.feedback.controls.reaction.setValue(value);
	}

}
