import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImgixAngularModule } from '@imgix/angular';

import { FeaturesComponent } from './components/features/features.component';
import { HeroComponent } from './components/hero/hero.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { CtaComponent } from './components/cta/cta.component';
import { StatsComponent } from './components/stats/stats.component';


@NgModule({
  declarations: [
		HomeComponent,
		HeroComponent,
  	FeaturesComponent,
   	ReviewsComponent,
    CtaComponent,
    StatsComponent,
  ],
  imports: [
    CommonModule,
		HomeRoutingModule,
		ImgixAngularModule,
  ]
})
export class HomeModule { }
