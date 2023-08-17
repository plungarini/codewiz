import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnDestroy {

	showBackButton = false;

	private routerSub: Subscription;

	constructor(
		private router: Router,
		private cdRef: ChangeDetectorRef,
	) {
		this.routerSub = this.router.events.subscribe(event => {
			const url = this.router.url;
			this.showBackButton = url.includes('/info/');
			this.cdRef.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
	}

}
