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
				loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule)
			},
			{
				path: 'billing',
				loadChildren: () => import('./pages/billing/billing.module').then(m => m.BillingModule)
			},
			{
				path: 'preferences',
				loadChildren: () => import('./pages/preferences/preferences.module').then(m => m.PreferencesModule)
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
