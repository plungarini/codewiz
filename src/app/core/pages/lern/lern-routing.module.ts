import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsGuard } from 'src/app/auth/guards/permissions.guard';
import { StagingAuthGuard } from 'src/app/auth/guards/staging-auth.guard';
import { MaintenanceGuard } from 'src/app/shared/guards/maintenance.guard';
import { ActiveOnboardingGuard } from '../onboarding/guard/onboarding-activate.guard';
import { LernComponent } from './lern.component';

const routes: Routes = [
	{
		path: '',
		data: {
			permissions: ['user', 'alpha'],
			preload: true,
			permissionsRedirect: '/app/lern/unauthorized',
		},
		canActivate: [PermissionsGuard, MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
		component: LernComponent,
		children: [
			{
				path: 'setup',
				data: {
					permissions: ['user', 'alpha'],
					preload: true,
					permissionsRedirect: '/app/lern/unauthorized',
				},
				canActivate: [PermissionsGuard, MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
				loadChildren: () => import('./pages/setup/setup.module').then(m => m.SetupModule),
			},
			{
				path: 'study',
				data: {
					permissions: ['user', 'alpha'],
					preload: true,
					permissionsRedirect: '/app/lern/unauthorized',
				},
				canActivate: [PermissionsGuard, MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
				loadChildren: () => import('./pages/study/study.module').then(m => m.StudyModule),
			},
			{
				path: '',
				redirectTo: 'setup',
				pathMatch: 'full',
			}
		]
	},
	{
		path: 'unauthorized',
		canActivate: [MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
		loadChildren: () => import('./pages/lern-unauthorized/lern-unauthorized.module').then(m => m.LernUnauthorizedModule),
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LernRoutingModule { }
