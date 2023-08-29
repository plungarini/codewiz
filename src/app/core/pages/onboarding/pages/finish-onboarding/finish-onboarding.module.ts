import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LottieModule } from 'ngx-lottie';
import { FinishOnboardingRoutingModule } from './finish-onboarding-routing.module';
import { FinishOnboardingComponent } from './finish-onboarding.component';


@NgModule({
  declarations: [
    FinishOnboardingComponent
  ],
  imports: [
    CommonModule,
		FinishOnboardingRoutingModule,
		LottieModule,
  ]
})
export class FinishOnboardingModule { }
