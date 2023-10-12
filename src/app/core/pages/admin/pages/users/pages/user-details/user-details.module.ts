import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { ImgixAngularModule } from '@imgix/angular';
import { MarkdownModule } from 'ngx-markdown';
import { UserActionsComponent } from './components/user-actions/user-actions.component';
import { UserChatsComponent } from './components/user-chats/user-chats.component';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { UserOverviewComponent } from './components/user-overview/user-overview.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { UserDetailsRoutingModule } from './user-details-routing.module';
import { UserDetailsComponent } from './user-details.component';
import { UserAddCreditsComponent } from './components/user-add-credits/user-add-credits.component';
import { UserUsagesComponent } from './components/user-usages/user-usages.component';


@NgModule({
  declarations: [
		UserDetailsComponent,
		UserHeaderComponent,
		UserOverviewComponent,
		UserActionsComponent,
  	UserRolesComponent,
   	UserChatsComponent,
    UserAddCreditsComponent,
    UserUsagesComponent,
  ],
  imports: [
    CommonModule,
		UserDetailsRoutingModule,
		ImgixAngularModule,
		ReactiveFormsModule,
		MarkdownModule,
  ]
})
export class UserDetailsModule { }
