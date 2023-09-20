import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { RepoPagesComponent } from './components/repo-pages/repo-pages.component';
import { EditPagesRoutingModule } from './edit-pages-routing.module';
import { EditPagesComponent } from './edit-pages.component';


@NgModule({
  declarations: [
		EditPagesComponent,
		RepoPagesComponent
  ],
  imports: [
    CommonModule,
		EditPagesRoutingModule,
		ReactiveFormsModule,
  ]
})
export class EditPagesModule { }
