import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { SubscriptionRemainingDaysComponent } from './components/profile-overview/components/subscription-remaining-days/subscription-remaining-days.component';


@NgModule({
	declarations: [
		HomeComponent,
  ProfileOverviewComponent,
  SubscriptionRemainingDaysComponent,
	],
  imports: [
    CommonModule,
		HomeRoutingModule,
		ImgixAngularModule,
  ]
})
export class HomeModule { }
