import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingComponent implements OnDestroy {

	currentPage = 'welcome';

	private routerSub: Subscription;

	constructor(
		private router: Router,
		private cdRef: ChangeDetectorRef,
	) {
		this.routerSub = this.router.events.subscribe(() => {
			const url = this.router.url;
			const newPage = url.split('/app/setup').pop()?.replaceAll('/', '') || 'welcome';
			if (newPage !== this.currentPage) {
				this.currentPage = newPage;
				this.cdRef.markForCheck();
			}
		})
	}

	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
	}

}
