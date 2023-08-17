import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { MaintenanceGuard } from '../shared/guards/maintenance.guard';
import { CoreComponent } from './core.component';

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		children: [
			{
				path: 'unauthorized',
				loadChildren: () => import('./pages/no-permissions/no-permissions.module').then(m => m.NoPermissionsModule),
			},
			{
				path: 'maintenance',
				loadChildren: () => import('./pages/maintenance/maintenance.module').then(m => m.MaintenanceModule),
			},
			{
				path: '',
				data: {
					permissions: ['user']
				},
				canActivate: [PermissionsGuard, MaintenanceGuard],
				loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
			},
			{
				path: 'settings',
				data: {
					permissions: ['user']
				},
				canActivate: [PermissionsGuard, MaintenanceGuard],
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
					permissions: ['user']
				},
				canActivate: [PermissionsGuard, MaintenanceGuard],
				loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule),
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
