import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BrevoService } from './shared/services/brevo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {

	private routerSub: Subscription;

	constructor(
		private router: Router,
		private brevoService: BrevoService,
	) {
		this.routerSub = this.router.events.subscribe(() => {
			const url = this.router.url;
			if (url.includes('/app') && !url.includes('/app/settings')) {
				return this.brevoService.hide();
			} else {
				return this.brevoService.show();
			}
		})
	}

	ngOnInit(): void {
		this.brevoService.initialize();
	}
	
	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
		this.brevoService.hide();	
	}
	
}
