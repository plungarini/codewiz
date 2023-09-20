import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ImgixAngularModule } from '@imgix/angular';
import { RepoMetaComponent } from './components/repo-meta/repo-meta.component';
import { RepoPreviewComponent } from './components/repo-preview/repo-preview.component';
import { RepoDetailsRoutingModule } from './repo-details-routing.module';
import { RepoDetailsComponent } from './repo-details.component';


@NgModule({
  declarations: [
    RepoDetailsComponent,
    RepoPreviewComponent,
    RepoMetaComponent,
  ],
  imports: [
    CommonModule,
		RepoDetailsRoutingModule,
		ImgixAngularModule,
		ReactiveFormsModule,
  ]
})
export class RepoDetailsModule { }
