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

	constructor(
		private router: Router,
		private tidioService: TidioService,
	) {
		this.routerSub = this.router.events.subscribe(() => {
			const url = this.router.url;
			if (url.includes('/app') && !url.includes('/app/settings')) {
				return this.tidioService.hide();
			} else {
				return this.tidioService.show();
			}
		})
	}

	ngOnInit(): void {
		this.tidioService.show();
	}
	
	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
	}
	
}
