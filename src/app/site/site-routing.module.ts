import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StagingAuthGuard } from '../auth/guards/staging-auth.guard';
import { SiteComponent } from './site.component';

const routes: Routes = [
	{
		path: '',
		component: SiteComponent,
		children: [
			{
				path: '',
				data: { preload: true },
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
			},
			{
				path: 'features',
				data: { preload: true },
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/features/features.module').then(m => m.FeaturesModule),
			},
			{
				path: 'pricing',
				data: { preload: true },
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/pricing/pricing.module').then(m => m.PricingModule),
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
  exports: [RouterModule]
})
export class SiteRoutingModule { }
