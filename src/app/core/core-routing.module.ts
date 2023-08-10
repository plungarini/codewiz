import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CoreComponent } from './core.component';

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
			},
			{
				path: 'settings',
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
