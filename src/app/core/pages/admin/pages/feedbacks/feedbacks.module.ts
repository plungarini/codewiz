import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { MarkdownModule } from 'ngx-markdown';
import { AppFeedbacksComponent } from './components/app-feedbacks/app-feedbacks.component';
import { ChatFeedbacksComponent } from './components/chat-feedbacks/chat-feedbacks.component';
import { LernFeedbacksComponent } from './components/lern-feedbacks/lern-feedbacks.component';
import { FeedbacksRoutingModule } from './feedbacks-routing.module';
import { FeedbacksComponent } from './feedbacks.component';


@NgModule({
  declarations: [
    FeedbacksComponent,
    AppFeedbacksComponent,
    ChatFeedbacksComponent,
    LernFeedbacksComponent
  ],
  imports: [
    CommonModule,
		FeedbacksRoutingModule,
		ImgixAngularModule,
		MarkdownModule,
  ]
})
export class FeedbacksModule { }
