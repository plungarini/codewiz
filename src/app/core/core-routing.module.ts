import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { StagingAuthGuard } from '../auth/guards/staging-auth.guard';
import { MaintenanceGuard } from '../shared/guards/maintenance.guard';
import { CoreComponent } from './core.component';
import { ActiveOnboardingGuard } from './pages/onboarding/guard/onboarding-activate.guard';
import { DeactiveOnboardingGuard } from './pages/onboarding/guard/onboarding-deactivate.guard';

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		children: [
			{
				path: 'unauthorized',
				data: {
					title: 'CodeWiz | Unauthorized',
					preload: true,
				},
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/no-permissions/no-permissions.module').then(m => m.NoPermissionsModule),
			},
			{
				path: 'maintenance',
				data: {
					title: 'CodeWiz | Maintenance',
					preload: true,
				},
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/maintenance/maintenance.module').then(m => m.MaintenanceModule),
			},
			{
				path: 'setup',
				data: {
					title: 'CodeWiz | Onboarding',
				},
				canDeactivate: [DeactiveOnboardingGuard],
				loadChildren: () => import('./pages/onboarding/onboarding.module').then(m => m.OnboardingModule),
			},
			{
				path: '',
				data: {
					title: 'CodeWiz | Dashboard',
					permissions: ['user'],
					preload: true,
				},
				canActivate: [PermissionsGuard, MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
				loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
			},
			{
				path: 'settings',
				data: {
					permissions: ['user'],
					preload: true,
				},
				canActivate: [PermissionsGuard, MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
				loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
			},
			{
				path: 'admin',
				data: {
					permissions: ['admin']
				},
				canActivate: [PermissionsGuard],
				loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
			},
			{
				path: 'chat/:repo/:id',
				data: {
					permissions: ['user'],
					preload: true,
				},
				canActivate: [PermissionsGuard, MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
				loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule),
			},
			{
				path: 'lern',
				data: {
					permissions: ['user', 'admin'],
					preload: false,
				},
				canActivate: [MaintenanceGuard, ActiveOnboardingGuard, StagingAuthGuard],
				loadChildren: () => import('./pages/lern/lern.module').then(m => m.LernModule),
			},
			{
				path: 'chat/:repo',
				pathMatch: 'full',
				redirectTo: 'chat/:repo/new'
			},
			{
				path: 'chat',
				pathMatch: 'full',
				redirectTo: 'chat/angular/new'
			},
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
