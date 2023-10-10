import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LernCourse } from 'src/app/core/pages/lern/models/course.model';

@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseOverviewComponent {

	@Input() course: LernCourse | undefined | null;

	getDummyArray(num: number) {
		const arr = [];
		for (let i = 0; i < num; i++) {
			arr.push(i);
		}
		return arr;
	}

	get completedSections() {
		return this.course?.sections.reduce(
			(acc, section) => acc + (section.progress?.completed ? 1 : 0),
			0
		) || 0;
	}

}
