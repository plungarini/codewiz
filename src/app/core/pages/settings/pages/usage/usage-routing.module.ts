import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsageComponent } from './usage.component';

const routes: Routes = [
	{
		path: '',
		component: UsageComponent,
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageRoutingModule { }
