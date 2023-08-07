import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UsersStatsComponent } from './components/users-stats/users-stats.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ChatStatsComponent } from './components/chat-stats/chat-stats.component';
import { IntegerNumberPipe } from './pipes/integer-number.pipe';


@NgModule({
  declarations: [
    DashboardComponent,
    UsersStatsComponent,
    ChatStatsComponent,
    IntegerNumberPipe
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
