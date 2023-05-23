import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';


@NgModule({
  declarations: [
    CoreComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    CoreRoutingModule
  ]
})
export class CoreModule { }
