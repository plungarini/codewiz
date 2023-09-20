import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ImgixAngularModule } from '@imgix/angular';
import { SearchRepoAutocompleteComponent } from './components/search-repo-autocomplete/search-repo-autocomplete.component';
import { SubscriptionRemainingComponent } from './components/subscription-remaining-days/subscription-remaining.component';
import { SubscriptionRemainingQueriesComponent } from './components/subscription-remaining-queries/subscription-remaining-queries.component';



@NgModule({
	declarations: [
		SubscriptionRemainingComponent,
		SubscriptionRemainingQueriesComponent,
		SearchRepoAutocompleteComponent,
	],
  imports: [
		CommonModule,
		ImgixAngularModule,
		ReactiveFormsModule,
	],
	exports: [
		SubscriptionRemainingComponent,
		SubscriptionRemainingQueriesComponent,
		SearchRepoAutocompleteComponent,
	],
})
export class SharedModule { }
