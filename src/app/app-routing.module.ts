import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
	{
		path: 'app',
		canActivate: [AuthGuard],
		loadChildren: () => import('./core/core.module').then(m => m.CoreModule)
	},
	{
		path: 'admin',
		loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
	},
	{
		path: 'auth',
		loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
	},

	// Redirects
	{
		path: 'login',
		redirectTo: 'auth/login',
		pathMatch: 'full',
	},
	{
		path: 'signup',
		redirectTo: 'auth/signup',
		pathMatch: 'full',
	},
	{
		path: '**',
		redirectTo: 'app', // TODO: Implement 404 page
		pathMatch: 'full',
	},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
