import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { FeedbackRoutingModule } from './feedback-routing.module';
import { FeedbackComponent } from './feedback.component';


@NgModule({
  declarations: [
    FeedbackComponent
  ],
  imports: [
    CommonModule,
		FeedbackRoutingModule,
		ReactiveFormsModule,
  ]
})
export class FeedbackModule { }
