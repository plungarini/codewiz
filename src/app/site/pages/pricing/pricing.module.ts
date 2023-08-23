import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PricingRoutingModule } from './pricing-routing.module';
import { PricingComponent } from './pricing.component';
import { HeroComponent } from './hero/hero.component';
import { PlansComponent } from './plans/plans.component';
import { PlanCardComponent } from './plans/plan-card/plan-card.component';


@NgModule({
  declarations: [
    PricingComponent,
    HeroComponent,
    PlansComponent,
    PlanCardComponent
  ],
  imports: [
    CommonModule,
    PricingRoutingModule
  ]
})
export class PricingModule { }
