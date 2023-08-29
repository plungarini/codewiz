import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OnboardingRoutingModule } from './onboarding-routing.module';
import { OnboardingComponent } from './onboarding.component';
import { OnboardNavigationComponent } from './components/onboard-navigation/onboard-navigation.component';


@NgModule({
  declarations: [
    OnboardingComponent,
    OnboardNavigationComponent,
  ],
  imports: [
    CommonModule,
    OnboardingRoutingModule
  ]
})
export class OnboardingModule { }
