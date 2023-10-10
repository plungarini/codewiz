import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-course-breadcrumb',
  templateUrl: './course-breadcrumb.component.html',
  styles: [
    `
      :host {
        @apply max-w-full block overflow-hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseBreadcrumbComponent {
	
	@Input() title: string = '';

}
