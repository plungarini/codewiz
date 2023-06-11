import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		children: [
			{
				path: 'chat/:repo/:id',
				loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule),
			},
			{
				path: 'chat/:repo',
				pathMatch: 'full',
				redirectTo: 'chat/:repo/new'
			},
			{
				path: 'chat',
				pathMatch: 'full',
				redirectTo: 'chat/angular/new'
			},
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
