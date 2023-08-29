import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InterestsComponent } from './interests.component';

const routes: Routes = [
	{
		path: '',
		component: InterestsComponent,
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterestsRoutingModule { }
