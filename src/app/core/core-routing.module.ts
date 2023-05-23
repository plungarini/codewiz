import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		children: [
			{ path: 'chat', loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule), }
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
