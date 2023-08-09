import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { SubscriptionRemainingQueriesComponent } from './components/profile-overview/components/subscription-remaining-days/subscription-remaining-days.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { BannerComponent } from './components/banner/banner.component';


@NgModule({
	declarations: [
		HomeComponent,
		ProfileOverviewComponent,
		SubscriptionRemainingQueriesComponent,
  BannerComponent,
	],
  imports: [
    CommonModule,
		HomeRoutingModule,
		ImgixAngularModule,
  ]
})
export class HomeModule { }
