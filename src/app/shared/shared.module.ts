import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImgixAngularModule } from '@imgix/angular';
import { LatestCoursesComponent } from './components/latest-courses/latest-courses.component';
import { SearchRepoAutocompleteComponent } from './components/search-repo-autocomplete/search-repo-autocomplete.component';
import { SubscriptionRemainingComponent } from './components/subscription-remaining-days/subscription-remaining.component';
import { SubscriptionRemainingQueriesComponent } from './components/subscription-remaining-queries/subscription-remaining-queries.component';



@NgModule({
	declarations: [
		SubscriptionRemainingComponent,
		SubscriptionRemainingQueriesComponent,
		SearchRepoAutocompleteComponent,
		LatestCoursesComponent,
	],
  imports: [
		CommonModule,
		ImgixAngularModule,
		ReactiveFormsModule,
		RouterModule,
	],
	exports: [
		SubscriptionRemainingComponent,
		SubscriptionRemainingQueriesComponent,
		SearchRepoAutocompleteComponent,
		LatestCoursesComponent,
	],
})
export class SharedModule { }
