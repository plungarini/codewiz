import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { UsersListRoutingModule } from './users-list-routing.module';
import { UsersListComponent } from './users-list.component';


@NgModule({
  declarations: [
    UsersListComponent
  ],
  imports: [
    CommonModule,
		UsersListRoutingModule,
		ImgixAngularModule,
  ]
})
export class UsersListModule { }
