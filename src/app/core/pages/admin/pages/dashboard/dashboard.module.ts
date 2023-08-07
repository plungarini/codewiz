import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UsersStatsComponent } from './components/users-stats/users-stats.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';


@NgModule({
  declarations: [
    DashboardComponent,
    UsersStatsComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
