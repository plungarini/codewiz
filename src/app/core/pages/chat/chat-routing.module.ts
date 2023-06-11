import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat.component';

const routes: Routes = [
	{
		path: '',
		component: ChatComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('./components/chat-view/chat-view.module').then((m) => m.ChatViewModule),
			},
			{
				path: '**',
				pathMatch: 'full',
				redirectTo: 'angular/new',
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
