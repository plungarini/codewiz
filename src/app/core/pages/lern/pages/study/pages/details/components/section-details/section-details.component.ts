import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { LernCourse, LernCourseSectionData } from 'src/app/core/pages/lern/models/course.model';
import { LernProgressService } from 'src/app/core/pages/lern/services/lern-progress.service';
import { LernQuizChange } from './models/quiz-changes.model';

@Component({
  selector: 'app-section-details',
  templateUrl: './section-details.component.html',
  styles: [
    `
      :host {
        @apply block pb-16;
      }

			markdown p, markdown li, markdown span, markdown div, markdown code, markdown pre {
				font-size: 1rem !important;
  			line-height: 1.5rem !important;
			}
    `
  ],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class SectionDetailsComponent implements OnDestroy {

	@Input('course') set setCourse(value: LernCourse | undefined | null) {
		this.course = value ?? undefined;
		this._initSection(this.lessonId);
	};

	course: LernCourse | undefined;
	currentSection: LernCourseSectionData | undefined;
	sectionId: string = '';
	quizCompletion: LernQuizChange | undefined;
	lessonId: string | null = null;
	nextSectionId: string | undefined = undefined;

	loading = false;

	private subscription: Subscription | undefined;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private cdRef: ChangeDetectorRef,
		private progress: LernProgressService,
	) {
		this.subscription = this.route.queryParamMap.pipe(
			map((params) => {
				return params.get('lesson');
			})
		).subscribe((data) => {
			this.lessonId = data;
			this._initSection(data);
		});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}

	onQuizChanges(event: LernQuizChange) {
		this.quizCompletion = event;
		this.cdRef.detectChanges();
	}

	async submit() {
		this.loading = true;
		this.cdRef.markForCheck();

		await this.progress.setSectionProgress(
			this.course?.id ?? '',
			this.sectionId,
			{ ...this.quizCompletion, completed: true }
		);

		this.router.navigate(['/app/lern/study', this.course?.id], {
			queryParams: { lesson: this.nextSectionId ?? 'completed' }
		});

		this.loading = false;
		this.cdRef.markForCheck();
	}

	private _initSection(section: string | null) {
		this.sectionId = section ?? '';
		this.currentSection = this.course?.sections
			.find((section) => section.id === this.sectionId);		
		const currentIndex = this.course?.sections.findIndex(
			(section) => section.id === this.sectionId
		);
		this.nextSectionId = this.course?.sections[(currentIndex ?? 0) + 1]?.id;
		this.cdRef.markForCheck();
	}

}
