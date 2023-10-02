import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
	{
		path: 'not-found',
		component: NotFoundComponent,
	},
	{
		path: ':id',
		loadChildren: () => import('./pages/details/details.module').then((m) => m.DetailsModule),
	},
	{
		path: '**',
		redirectTo: 'not-found',
		pathMatch: 'full',
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudyRoutingModule { }
