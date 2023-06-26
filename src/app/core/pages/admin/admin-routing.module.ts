import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

const routes: Routes = [
	{
		path: '',
		component: AdminComponent,
		children: [
			{
				path: 'repos',
				loadChildren: () => import('./pages/repos/repos.module').then(m => m.ReposModule),
			},

			// Redirects
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'repos',
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
