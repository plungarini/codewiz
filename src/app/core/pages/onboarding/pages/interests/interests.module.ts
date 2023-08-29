import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterestsRoutingModule } from './interests-routing.module';
import { InterestsComponent } from './interests.component';


@NgModule({
  declarations: [
    InterestsComponent
  ],
  imports: [
    CommonModule,
    InterestsRoutingModule
  ]
})
export class InterestsModule { }
