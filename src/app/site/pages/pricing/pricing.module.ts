import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HeroComponent } from './components/hero/hero.component';
import { PlanCardComponent } from './components/plans/plan-card/plan-card.component';
import { PlansComponent } from './components/plans/plans.component';
import { PricingRoutingModule } from './pricing-routing.module';
import { PricingComponent } from './pricing.component';


@NgModule({
  declarations: [
    PricingComponent,
		HeroComponent,
		PlansComponent,
		PlanCardComponent,
  ],
  imports: [
    CommonModule,
    PricingRoutingModule
  ]
})
export class PricingModule { }
