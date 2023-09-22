import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntroComponent } from './pages/intro/intro.component';
import { SetupComponent } from './setup.component';

const routes: Routes = [
	{
		path: ':id',
		component: SetupComponent,
		children: [
			{
				path: 'hub',
				component: IntroComponent,
			},
			{
				path: 'search',
				loadChildren: () => import('./pages/search/search.module').then((m) => m.SearchModule),
			},
			{
				path: 'preferences',
				loadChildren: () => import('./pages/preferences/preferences.module').then((m) => m.PreferencesModule),
			},
			{
				path: '',
				redirectTo: 'hub',
				pathMatch: 'full',
			}
		]
	},
	{
		path: '',
		redirectTo: 'new',
		pathMatch: 'full',
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
