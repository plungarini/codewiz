import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SubscriptionRemainingComponent } from './components/subscription-remaining-days/subscription-remaining.component';
import { SubscriptionRemainingQueriesComponent } from './components/subscription-remaining-queries/subscription-remaining-queries.component';



@NgModule({
	declarations: [
		SubscriptionRemainingComponent,
  SubscriptionRemainingQueriesComponent,
	],
  imports: [
    CommonModule
	],
	exports: [
		SubscriptionRemainingComponent,
  SubscriptionRemainingQueriesComponent,
	],
})
export class SharedModule { }
