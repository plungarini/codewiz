import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntroComponent } from './pages/intro/intro.component';
import { PromptComponent } from './pages/prompt/prompt.component';
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
				path: 'prompt',
				component: PromptComponent,
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
