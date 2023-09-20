import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoPermissionsComponent } from './no-permissions.component';

const routes: Routes = [
	{
		path: '',
		component: NoPermissionsComponent,
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoPermissionsRoutingModule { }
