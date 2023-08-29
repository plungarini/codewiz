import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnboardingComponent } from './onboarding.component';

const routes: Routes = [
	{
		path: '',
		component: OnboardingComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule),
			},
			{
				path: 'interests',
				loadChildren: () => import('./pages/interests/interests.module').then(m => m.InterestsModule),
			},
			{
				path: 'experience',
				loadChildren: () => import('./pages/experience/experience.module').then(m => m.ExperienceModule),
			},
			{
				path: 'goals',
				loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsModule),
			},
			{
				path: 'ready',
				loadChildren: () => import('./pages/finish-onboarding/finish-onboarding.module').then(m => m.FinishOnboardingModule),
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
