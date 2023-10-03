import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { PreferencesRoutingModule } from './preferences-routing.module';
import { PreferencesComponent } from './preferences.component';


@NgModule({
  declarations: [
    PreferencesComponent
  ],
  imports: [
    CommonModule,
		PreferencesRoutingModule,
		ReactiveFormsModule,
  ]
})
export class PreferencesModule { }
