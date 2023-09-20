import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinishOnboardingComponent } from './finish-onboarding.component';

const routes: Routes = [
	{
		path: '',
		component: FinishOnboardingComponent,
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinishOnboardingRoutingModule { }
