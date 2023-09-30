import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserRepoService } from 'src/app/core/pages/chat/services/user-repo.service';
import { Repo } from 'src/app/shared/models/repo.model';
import { LernCourseRequest } from '../../../../models/course.model';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-latest-courses',
  templateUrl: './latest-courses.component.html',
  styles: [
    `
      :host {
        display: block;
      }

			@keyframes aicolors {
				0% {
					stroke: #818cf8;
				}
				33.33% {
					stroke: #ec4899;
				}
				66.66% {
					stroke: #0369a1;
				}
				100% {
					stroke: #818cf8;
				}
			}
			.animate-aicolors {
				animation: aicolors 5s linear infinite;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestCoursesComponent implements OnDestroy {

	loaded = false;

	courses: LernCourseRequest[] = [];
	repos$ = this.repos.getAllSupportedDocs();

	private coursesSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private lern: LernService,
		private repos: UserRepoService,
	) {
		this.coursesSub = this.lern.getAll(10)
			.subscribe((courses) => {
				if (!this.loaded) this.loaded = true;

				this.courses = courses;
				this.cdRef.markForCheck();
			})
	}

	ngOnDestroy(): void {
		this.coursesSub.unsubscribe();
	}

	getFakeSectionsBuildingArray(itemsCount: number): number[] {
		return Array.from(Array(itemsCount).keys());
	}

	getPercentageCompletion(generation: LernCourseRequest['generation']): string {
		if (!generation) return '5%';
		if (generation?.completed) return '100%';
		const total = generation.totalSections + 1;
		const completed = generation.completedSections + (generation.planCompleted ? 1 : 0);
		const perc = (completed / total) < 0.05 ? 0.05 : (completed / total);
		return Math.round(perc * 100) + '%';
	}

	getRepoLogo(id: string, repos: Repo[] | null): string {
		if (!repos) return '';
		return repos.find(r => r.id === id)?.logo ?? '';
	}

	getTimeDifference(date?: Date): string {
		if (!date) return 'Few secs ago';
		const currentTime = new Date();
		const diffInMinutes = Math.floor((currentTime.getTime() - date.getTime()) / (1000 * 60));
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInMinutes < 1) {
			return 'just now';
		} else if (diffInMinutes < 60) {
			return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
		} else if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
		} else {
			return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
		}
	}

	trackBy(i: number, item: LernCourseRequest): string {
		return item.id || i.toString();
	}

}
