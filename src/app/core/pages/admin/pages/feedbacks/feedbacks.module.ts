import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeedbacksRoutingModule } from './feedbacks-routing.module';
import { FeedbacksComponent } from './feedbacks.component';
import { AppFeedbacksComponent } from './components/app-feedbacks/app-feedbacks.component';
import { ChatFeedbacksComponent } from './components/chat-feedbacks/chat-feedbacks.component';
import { LernFeedbacksComponent } from './components/lern-feedbacks/lern-feedbacks.component';


@NgModule({
  declarations: [
    FeedbacksComponent,
    AppFeedbacksComponent,
    ChatFeedbacksComponent,
    LernFeedbacksComponent
  ],
  imports: [
    CommonModule,
    FeedbacksRoutingModule
  ]
})
export class FeedbacksModule { }
