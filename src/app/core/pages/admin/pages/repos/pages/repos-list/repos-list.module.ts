import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { ReposListRoutingModule } from './repos-list-routing.module';
import { ReposListComponent } from './repos-list.component';


@NgModule({
  declarations: [
    ReposListComponent
  ],
  imports: [
    CommonModule,
		ReposListRoutingModule,
		ImgixAngularModule,
  ]
})
export class ReposListModule { }
