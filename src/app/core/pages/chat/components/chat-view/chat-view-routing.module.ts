import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatViewComponent } from './chat-view.component';

const routes: Routes = [
	{
		path: '',
		component: ChatViewComponent,
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatViewRoutingModule { }
