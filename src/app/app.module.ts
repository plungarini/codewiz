import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient } from '@angular/common/http';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from '@firebase/firestore';
import { ImgixAngularModule } from '@imgix/angular';
import { LottieModule } from 'ngx-lottie';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { markedOptionsFactory } from './core/pages/chat/components/chat-view/components/messages/md-blocks';

export function playerFactory() {
  return import('lottie-web');
}

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
		provideFirestore(() => {
			return initializeFirestore(getApp(), {
				ignoreUndefinedProperties: true,
				localCache: persistentLocalCache({
					cacheSizeBytes: 10,
					tabManager: persistentMultipleTabManager(),
				})
			})
		}),
		provideFunctions(() => getFunctions(undefined, 'europe-west2')),
		provideStorage(() => getStorage()),
		providePerformance(() => getPerformance()),
		provideRemoteConfig(() => getRemoteConfig()),
		
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

		LottieModule.forRoot({ player: playerFactory }),
  ],
  providers: [
		ScreenTrackingService,
		UserTrackingService,
		provideHttpClient(),
	],
  bootstrap: [AppComponent]
})
export class AppModule { }
