import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { IdeasComponent } from './components/ideas/ideas.component';
import { LatestChatsComponent } from './components/latest-chats/latest-chats.component';
import { PhBannerComponent } from './components/ph-banner/ph-banner.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { SubscriptionOverviewComponent } from './components/subscription-overview/subscription-overview.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';


@NgModule({
	declarations: [
		HomeComponent,
		ProfileOverviewComponent,
		LatestChatsComponent,
		IdeasComponent,
  	SubscriptionOverviewComponent,
   PhBannerComponent,
	],
  imports: [
    CommonModule,
		HomeRoutingModule,
		SharedModule,
		ImgixAngularModule,
  ]
})
export class HomeModule { }
