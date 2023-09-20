import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoPermissionsRoutingModule } from './no-permissions-routing.module';
import { NoPermissionsComponent } from './no-permissions.component';


@NgModule({
  declarations: [
    NoPermissionsComponent
  ],
  imports: [
    CommonModule,
    NoPermissionsRoutingModule
  ]
})
export class NoPermissionsModule { }
