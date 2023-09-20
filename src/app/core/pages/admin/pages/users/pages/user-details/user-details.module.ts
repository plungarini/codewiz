import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { UserActionsComponent } from './components/user-actions/user-actions.component';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { UserOverviewComponent } from './components/user-overview/user-overview.component';
import { UserDetailsRoutingModule } from './user-details-routing.module';
import { UserDetailsComponent } from './user-details.component';


@NgModule({
  declarations: [
		UserDetailsComponent,
		UserHeaderComponent,
		UserOverviewComponent,
		UserActionsComponent,
  ],
  imports: [
    CommonModule,
		UserDetailsRoutingModule,
		ImgixAngularModule,
  ]
})
export class UserDetailsModule { }
