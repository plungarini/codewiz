import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LernCourseSectionData, LernCourseSectionDataProgress } from 'src/app/core/pages/lern/models/course.model';
import { LernQuizChange } from '../../models/quiz-changes.model';

@Component({
  selector: 'app-section-quiz',
  templateUrl: './section-quiz.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionQuizComponent implements OnDestroy {

	@Input('quizCompletions') set setQuizCompletions(value: LernCourseSectionDataProgress | undefined) {
		this.quizCompletions = value;
		this.initQuizChanges();
		this.cdRef.markForCheck();
	};
	@Input('quiz') set setQuiz(value: LernCourseSectionData['content']['quiz']) {
		if (!value) return;
		this.quiz = {
			...value,
			quizType: this._getNormOptionType(value),
			options: this._shuffleArray(value.options),
		};
		this.single.setValue(-1);
		this.multi = new Set();
		this.validOptions = this.quiz.options.filter((o) => o.isCorrect).length;
		this.initQuizChanges();
		this.cdRef.markForCheck();
	};

	@Output() quizChange = new EventEmitter<LernQuizChange>();

	quizCompletions: LernCourseSectionDataProgress | undefined;
	quiz: LernCourseSectionData['content']['quiz'];
	single = new FormControl(-1, { nonNullable: true, validators: [Validators.required] });
	multi: Set<number> = new Set();
	validOptions = 1;

	private _controlSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		this._controlSub = this.single.valueChanges.subscribe((value) => {
			const option = this.quiz?.options[value - 1];
			const optionValue = option?.option;
			const id = optionValue ? this._getOptionId(optionValue) : undefined;
			const valid = !!option?.isCorrect;
			this.quizChange.emit({
				singleQuiz: id,
				valid: !!id && valid,
			});
		})
	}

	ngOnDestroy(): void {
		this._controlSub.unsubscribe();
	}

	setMultiOption(option: number, event: Event) {
		const input = event.target as HTMLInputElement | undefined;
		const checked = !!input?.checked;
		if (this.multi.has(option) && !checked) {
			this.multi.delete(option);
		} else if (!this.multi.has(option) && checked) {
			this.multi.add(option);
		}
		this.cdRef.markForCheck();

		const areAllOptionsValid = [...this.multi]
			.reduce((acc, o) => acc && !!this.quiz?.options[o - 1]?.isCorrect, true);
		const ids = [...this.multi]
			.map((o) => this._getOptionId(this.quiz?.options[o - 1]?.option ?? ''))
			.filter((id) => !!id);
		this.quizChange.emit({
			multiQuiz: ids,
			valid: ids.length === this.validOptions && areAllOptionsValid,
		});
	}

	private initQuizChanges() {
		this.quizCompletions?.multiQuiz?.forEach((id) => {
			this.quiz?.options.forEach((o, i) => {
				if (this._getOptionId(o.option ?? '') === id) {
					this.multi.add(i + 1);
				}
			})
		});
		this.quiz?.options.forEach((o, i) => {
			if (this._getOptionId(o.option ?? '') === this.quizCompletions?.singleQuiz) {
				this.single.setValue(i + 1);
			}
		});

		if (this.quizCompletions?.multiQuiz) {
			const areAllOptionsValid = [...this.multi]
				.reduce((acc, o) => acc && !!this.quiz?.options[o - 1]?.isCorrect, true);
			const ids = [...this.multi]
				.map((o) => this._getOptionId(this.quiz?.options[o - 1]?.option ?? ''))
				.filter((id) => !!id);
			this.quizChange.emit({
				multiQuiz: ids,
				valid: ids.length === this.validOptions && areAllOptionsValid,
			});
		}
	}

	private _getOptionId(option: string) {
		return option.trim().replace(/\s/gm, '-').toLowerCase();
	}

	private _getNormOptionType(quiz: LernCourseSectionData['content']['quiz']): 'multi' | 'single' {
		return (quiz?.options.filter((o) => o.isCorrect).length ?? 0) > 1 ? 'multi' : 'single';
	}

	private _shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
			[array[i], array[j]] = [array[j], array[i]];   // Swap elements
    }
    return array;
	}

}
