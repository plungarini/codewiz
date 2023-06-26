import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReposListRoutingModule } from './repos-list-routing.module';
import { ReposListComponent } from './repos-list.component';


@NgModule({
  declarations: [
    ReposListComponent
  ],
  imports: [
    CommonModule,
    ReposListRoutingModule
  ]
})
export class ReposListModule { }
