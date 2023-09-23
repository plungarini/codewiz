import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { IntroComponent } from './pages/intro/intro.component';
import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';
import { FinishedComponent } from './pages/finished/finished.component';


@NgModule({
  declarations: [
    SetupComponent,
    IntroComponent,
    FinishedComponent,
    
  ],
  imports: [
    CommonModule,
		SetupRoutingModule,
		SharedModule,
		
  ]
})
export class SetupModule { }
