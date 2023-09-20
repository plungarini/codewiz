import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImgixAngularModule } from '@imgix/angular';
import { ChatComponent } from './chat/chat.component';
import { FeaturesRoutingModule } from './features-routing.module';
import { FeaturesComponent } from './features.component';
import { LearnComponent } from './learn/learn.component';
import { CtaComponent } from './cta/cta.component';


@NgModule({
  declarations: [
    FeaturesComponent,
    ChatComponent,
    LearnComponent,
    CtaComponent
  ],
  imports: [
    CommonModule,
		FeaturesRoutingModule,
		ImgixAngularModule,
  ]
})
export class FeaturesModule { }
