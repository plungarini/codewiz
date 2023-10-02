import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NotFoundComponent } from './pages/not-found/not-found.component';
import { StudyRoutingModule } from './study-routing.module';
import { StudyComponent } from './study.component';


@NgModule({
  declarations: [
    StudyComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    StudyRoutingModule
  ]
})
export class StudyModule { }
