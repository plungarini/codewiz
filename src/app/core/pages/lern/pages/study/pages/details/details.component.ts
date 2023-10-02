import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { LernCourse } from '../../../../models/course.model';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full sm:h-screen sm:max-h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnDestroy {

	@ViewChild('scrollContainer', { static: true }) scrollContainer: ElementRef<HTMLDivElement> | undefined;

	course$: Observable<LernCourse | undefined>;

	private _routeSub: Subscription;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private lern: LernService,
	) {
		this.course$ = this._initCourse$();

		this._routeSub = this.router.events.pipe(
			filter((e) => e instanceof NavigationEnd),
		).subscribe(() => {
			this._scrollToTop();
		});
	}

	ngOnDestroy(): void {
		this._routeSub.unsubscribe();
	}

	private _initCourse$() {
		return this.route.paramMap.pipe(
			switchMap((params) => {
				const id = params.get('id');
				return this.lern.getFullCourse(id);
			}),
			map((course) => {
				if (!course) return undefined;
				const sorted = [...course.sections].sort((a, b) => a.order - b.order);
				return {
					...course,
					sections: sorted,
				} as LernCourse | undefined;
			}),
			tap((course) => {
				if (!course?.id || this.route.snapshot.queryParams['lesson']) return;
				const sorted = [...course.sections].sort((a, b) => a.order - b.order);
				const incompleted = sorted.filter((s) => !s.progress?.completed);
				const firstLessonId = incompleted?.at(0)?.id ?? sorted?.at(0)?.id;
				if (!firstLessonId) return;
				this.router.navigate(
					['/app/lern/study/', course.id],
					{ queryParams: {lesson: firstLessonId} }
				);
			}),
		);
	}

	private _scrollToTop() {
		const element = this.scrollContainer?.nativeElement;
		if (!element) return;
		element.scroll({
			top: 0,
			behavior: 'smooth',
		})
	}

}
