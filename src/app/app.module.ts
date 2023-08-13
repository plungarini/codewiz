import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient } from '@angular/common/http';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ImgixAngularModule } from '@imgix/angular';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { markedOptionsFactory } from './core/pages/chat/components/chat-view/components/messages/md-blocks';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
		BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
		provideFunctions(() => getFunctions(undefined, 'europe-west2')),
		provideStorage(() => getStorage()),
		
		MarkdownModule.forRoot({
			sanitize: SecurityContext.HTML,
			markedOptions: {
				provide: MarkedOptions,
				useFactory: markedOptionsFactory,
			}
		}),

		ImgixAngularModule.forRoot({
      domain: 'codewiz.imgix.net',
      defaultImgixParams: {
        auto: 'format,compress',
      },
    }),
  ],
  providers: [
		ScreenTrackingService,
		UserTrackingService,
		provideHttpClient(),
	],
  bootstrap: [AppComponent]
})
export class AppModule { }
