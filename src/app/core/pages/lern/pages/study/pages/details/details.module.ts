import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { CourseBreadcrumbComponent } from './components/course-breadcrumb/course-breadcrumb.component';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { SectionCompletedComponent } from './components/section-details/components/section-completed/section-completed.component';
import { SectionQuizComponent } from './components/section-details/components/section-quiz/section-quiz.component';
import { SectionDetailsComponent } from './components/section-details/section-details.component';
import { DetailsRoutingModule } from './details-routing.module';
import { DetailsComponent } from './details.component';


@NgModule({
	declarations: [
		DetailsComponent,
		SectionDetailsComponent,
		CourseOverviewComponent,
		CourseBreadcrumbComponent,
		SectionQuizComponent,
		SectionCompletedComponent,
	],
  imports: [
    CommonModule,
		DetailsRoutingModule,
		ReactiveFormsModule,
		MarkdownModule.forChild(),
  ]
})
export class DetailsModule { }
