import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { UsageRoutingModule } from './usage-routing.module';
import { UsageComponent } from './usage.component';


@NgModule({
  declarations: [
    UsageComponent
  ],
  imports: [
    CommonModule,
		UsageRoutingModule,
		SharedModule,
  ]
})
export class UsageModule { }
