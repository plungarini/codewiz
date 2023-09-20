import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

const routes: Routes = [
	{
		path: '',
		component: AdminComponent,
		children: [
			{
				path: '',
				data: {
					title: 'CodeWiz | Admin - Dashboard',
					preload: true,
				},
				loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
			},
			{
				path: 'repos',
				data: {
					title: 'CodeWiz | Admin - Repos manager',
					preload: true,
				},
				loadChildren: () => import('./pages/repos/repos.module').then(m => m.ReposModule),
			},
			{
				path: 'users',
				data: {
					title: 'CodeWiz | Admin - Users manager',
					preload: true,
				},
				loadChildren: () => import('./pages/users/users.module').then(m => m.UsersModule),
			},
			{
				path: 'maintenance',
				data: {
					title: 'CodeWiz | Admin - Maintenance',
					preload: true,
				},
				loadChildren: () => import('./pages/maintenance/maintenance.module').then(m => m.MaintenanceModule),
			},
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
