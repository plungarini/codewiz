import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepoDetailsRoutingModule } from './repo-details-routing.module';
import { RepoDetailsComponent } from './repo-details.component';


@NgModule({
  declarations: [
    RepoDetailsComponent
  ],
  imports: [
    CommonModule,
    RepoDetailsRoutingModule
  ]
})
export class RepoDetailsModule { }
