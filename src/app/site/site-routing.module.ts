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
				data: {
					title: 'CodeWiz | Instant AI-Powered Coding Solutions – Faster than StackOverflow',
					description: 'Meet CodeWiz – your AI coding companion. Dive into real-time chats, unravel coding mysteries faster than you can type "StackOverflow", and code with confidence. Embrace the future of coding assistance today!',
					preload: true
				},
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
			},
			{
				path: 'features',
				data: {
					title: 'CodeWiz: Unveiling Next-Gen AI Features Every Developer Dreamed Of',
					description: 'Dive into CodeWiz\'s revolutionary features! Instant answers, real-time guidance, and quizzes, all powered by cutting-edge AI. Forget waiting on forums; your on-demand coding guru is here. Explore now and code with newfound confidence.',
					preload: true
				},
				canActivate: [StagingAuthGuard],
				loadChildren: () => import('./pages/features/features.module').then(m => m.FeaturesModule),
			},
			{
				path: 'pricing',
				data: {
					title: 'Unlock Your Coding Superpowers: CodeWiz Pricing Plans',
					description: 'Discover our enchanting pricing options and supercharge your coding journey with CodeWiz. Choose the perfect plan to become a coding wizard. Don\'t miss out on the magic!',
					preload: true
				},
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
