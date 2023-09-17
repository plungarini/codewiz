import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
		children: [
			{
				path: '',
				data: {
					title: 'CodeWiz | Settings - Manage Profile',
				},
				loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
			},
			{
				path: 'usage',
				data: {
					title: 'CodeWiz | Settings - Subscription Usage',
				},
				loadChildren: () => import('./pages/usage/usage.module').then(m => m.UsageModule),
			},
			{
				path: 'billing',
				data: {
					title: 'CodeWiz | Settings - Billing'
				},
				loadChildren: () => import('./pages/billing/billing.module').then(m => m.BillingModule),
			},
			/* {
				path: 'preferences',
				loadChildren: () => import('./pages/preferences/preferences.module').then(m => m.PreferencesModule),
			}, */
			{
				path: 'feedback',
				data: {
					title: 'CodeWiz | Settings - Your feedbacks',
				},
				loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackModule),
			},
			{
				path: 'legal',
				data: {
					title: 'CodeWiz | Settings - Legal Documents',
				},
				loadChildren: () => import('./pages/legal/legal.module').then(m => m.LegalModule),
			},
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
