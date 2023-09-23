import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { LatestCoursesComponent } from './components/latest-courses/latest-courses.component';
import { FinishedComponent } from './pages/finished/finished.component';
import { IntroComponent } from './pages/intro/intro.component';
import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';


@NgModule({
  declarations: [
    SetupComponent,
    IntroComponent,
    FinishedComponent,
    LatestCoursesComponent,
    
  ],
  imports: [
    CommonModule,
		SetupRoutingModule,
		SharedModule,
		ImgixAngularModule,
  ]
})
export class SetupModule { }
