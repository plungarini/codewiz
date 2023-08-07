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
				loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
			},
			{
				path: 'repos',
				loadChildren: () => import('./pages/repos/repos.module').then(m => m.ReposModule),
			},
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
