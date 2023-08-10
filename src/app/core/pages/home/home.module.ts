import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { BannerComponent } from './components/banner/banner.component';
import { IdeasComponent } from './components/ideas/ideas.component';
import { LatestChatsComponent } from './components/latest-chats/latest-chats.component';
import { SubscriptionRemainingQueriesComponent } from './components/profile-overview/components/subscription-remaining-days/subscription-remaining-days.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';


@NgModule({
	declarations: [
		HomeComponent,
		ProfileOverviewComponent,
		SubscriptionRemainingQueriesComponent,
		BannerComponent,
		LatestChatsComponent,
		IdeasComponent,
	],
  imports: [
    CommonModule,
		HomeRoutingModule,
		ImgixAngularModule,
  ]
})
export class HomeModule { }
