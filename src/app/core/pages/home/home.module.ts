import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { BannerComponent } from './components/banner/banner.component';
import { IdeasComponent } from './components/ideas/ideas.component';
import { LatestChatsComponent } from './components/latest-chats/latest-chats.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SubscriptionOverviewComponent } from './components/subscription-overview/subscription-overview.component';


@NgModule({
	declarations: [
		HomeComponent,
		ProfileOverviewComponent,
		BannerComponent,
		LatestChatsComponent,
		IdeasComponent,
  SubscriptionOverviewComponent,
	],
  imports: [
    CommonModule,
		HomeRoutingModule,
		SharedModule,
		ImgixAngularModule,
  ]
})
export class HomeModule { }
