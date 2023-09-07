import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TidioService } from './shared/services/tidio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {

	private routerSub: Subscription;
	private consentInitialized = false;

	constructor(
		private router: Router,
		private tidioService: TidioService,
	) {
		const url = this.router.url;
		if (url.includes('/app') && !url.includes('/app/settings')) {
			this.tidioService.hide();
		} else {
			this.tidioService.show();
		}
	
		this.routerSub = this.router.events.subscribe(() => {
			const _url = this.router.url;
			if (_url.includes('/app') && !_url.includes('/app/settings')) {
				return this.tidioService.hide();
			} else {
				return this.tidioService.show();
			}
		});

		const originalPush = (window as any).dataLayer.push;
		(window as any).dataLayer.push = (data: any) => {
			originalPush.call((window as any).dataLayer, data);

			if (data.event === 'userPrefUpdate') {
				if (!this.consentInitialized) {
					this.consentInitialized = true;
					return;
				} else {
					location.href = location.href;
				}
			}
		};
	}

	ngOnInit(): void {
		const url = this.router.url;
		if (url.includes('/app') && !url.includes('/app/settings')) {
			return this.tidioService.hide();
		} else {
			return this.tidioService.show();
		}
	}
	
	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
	}
	
}
