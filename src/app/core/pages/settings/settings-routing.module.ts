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
				loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
			},
			{
				path: 'usage',
				loadChildren: () => import('./pages/usage/usage.module').then(m => m.UsageModule),
			},
			{
				path: 'billing',
				loadChildren: () => import('./pages/billing/billing.module').then(m => m.BillingModule),
			},
			{
				path: 'preferences',
				loadChildren: () => import('./pages/preferences/preferences.module').then(m => m.PreferencesModule),
			},
			{
				path: 'legal',
				loadChildren: () => import('./pages/legal/legal.module').then(m => m.LegalModule),
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
