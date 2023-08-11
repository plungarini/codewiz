import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SubscriptionRemainingComponent } from './components/subscription-remaining-days/subscription-remaining.component';



@NgModule({
	declarations: [
		SubscriptionRemainingComponent,
	],
  imports: [
    CommonModule
	],
	exports: [
		SubscriptionRemainingComponent,
	],
})
export class SharedModule { }
