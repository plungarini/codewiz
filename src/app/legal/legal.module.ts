import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PrivacyRoutingModule } from './legal-routing.module';
import { LegalComponent } from './legal.component';


@NgModule({
  declarations: [
    LegalComponent
  ],
  imports: [
    CommonModule,
    PrivacyRoutingModule
  ]
})
export class PrivacyModule { }
