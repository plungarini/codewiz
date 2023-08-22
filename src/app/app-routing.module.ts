import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { CustomPreloadingStrategyService } from './shared/services/custom-preloading-strategy.service';

const routes: Routes = [
	{
		path: '',
		data: { preload: true },
		loadChildren: () => import('./site/site.module').then(m => m.SiteModule),
	},
	{
		path: 'app',
		canActivate: [AuthGuard],
		loadChildren: () => import('./core/core.module').then(m => m.CoreModule)
	},
	{
		path: 'auth',
		data: { preload: true },
		loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
	},
	{
		path: 'legal/:id',
		loadChildren: () => import('./legal/legal.module').then(m => m.PrivacyModule)
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
	imports: [RouterModule.forRoot(routes, {
		anchorScrolling: 'enabled',
		scrollPositionRestoration: 'enabled',
		preloadingStrategy: CustomPreloadingStrategyService,
	})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
