import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { ImgixAngularModule } from '@imgix/angular';
import { AvatarComponent } from './components/avatar/avatar.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';


@NgModule({
	declarations: [
		SearchComponent,
    AvatarComponent,
	],
  imports: [
    CommonModule,
		SearchRoutingModule,
		ImgixAngularModule,
		ReactiveFormsModule,
  ]
})
export class SearchModule { }
