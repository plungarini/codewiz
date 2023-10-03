import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LernUnauthorizedComponent } from './lern-unauthorized.component';

const routes: Routes = [
	{
		path: '',
		component: LernUnauthorizedComponent,
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LernUnauthorizedRoutingModule { }
