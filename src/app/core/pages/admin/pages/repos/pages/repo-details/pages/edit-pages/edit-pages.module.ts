import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditPagesRoutingModule } from './edit-pages-routing.module';
import { EditPagesComponent } from './edit-pages.component';


@NgModule({
  declarations: [
    EditPagesComponent
  ],
  imports: [
    CommonModule,
    EditPagesRoutingModule
  ]
})
export class EditPagesModule { }
