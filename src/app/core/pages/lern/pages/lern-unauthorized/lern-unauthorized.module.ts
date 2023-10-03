import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LernUnauthorizedRoutingModule } from './lern-unauthorized-routing.module';
import { LernUnauthorizedComponent } from './lern-unauthorized.component';


@NgModule({
  declarations: [
    LernUnauthorizedComponent
  ],
  imports: [
    CommonModule,
    LernUnauthorizedRoutingModule
  ]
})
export class LernUnauthorizedModule { }
