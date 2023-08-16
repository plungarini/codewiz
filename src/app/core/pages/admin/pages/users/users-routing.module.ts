import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users.component';

const routes: Routes = [
	{
		path: '',
		component: UsersComponent,
		children: [
			{
				path: ':id',
				loadChildren: () => import('./pages/user-details/user-details.module').then(m => m.UserDetailsModule),
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
