import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReposComponent } from './repos.component';

const routes: Routes = [
	{
		path: '',
		component: ReposComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('./pages/repos-list/repos-list.module').then(m => m.ReposListModule)
			},
			{
				path: 'new',
				loadChildren: () => import('./pages/repo-details/repo-details.module').then(m => m.RepoDetailsModule)
			},
			{
				path: 'edit/:id',
				loadChildren: () => import('./pages/repo-details/repo-details.module').then(m => m.RepoDetailsModule)
			},
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReposRoutingModule { }
