import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepoDetailsComponent } from './repo-details.component';

const routes: Routes = [
	{
		path: '',
		component: RepoDetailsComponent
	},
	{
		path: 'edit-pages',
		loadChildren: () => import('./pages/edit-pages/edit-pages.module').then(m => m.EditPagesModule)
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepoDetailsRoutingModule { }
