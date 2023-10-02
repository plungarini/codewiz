import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-course-breadcrumb',
  templateUrl: './course-breadcrumb.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseBreadcrumbComponent {

}
