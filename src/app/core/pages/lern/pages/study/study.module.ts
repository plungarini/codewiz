import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImgixAngularModule } from '@imgix/angular';
import { LatestCoursesComponent } from './pages/not-found/components/latest-courses/latest-courses.component';

import { NotFoundComponent } from './pages/not-found/not-found.component';
import { StudyRoutingModule } from './study-routing.module';
import { StudyComponent } from './study.component';


@NgModule({
  declarations: [
    StudyComponent,
		NotFoundComponent,
		LatestCoursesComponent
  ],
  imports: [
    CommonModule,
		StudyRoutingModule,
		ImgixAngularModule,
  ]
})
export class StudyModule { }
