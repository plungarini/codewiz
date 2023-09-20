import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LernRoutingModule } from './lern-routing.module';
import { LernComponent } from './lern.component';


@NgModule({
  declarations: [
    LernComponent
  ],
  imports: [
    CommonModule,
    LernRoutingModule
  ]
})
export class LernModule { }
