import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Component({
  templateUrl: './billing.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full relative;
      }

			@keyframes wiggle {
				0%, 100% {
					transform: translateX(-15%);
					animation-timing-function: cubic-bezier(0.8,0,1,1);
				}
				50% {
					transform: none;
					animation-timing-function: cubic-bezier(0,0,0.2,1);
				}
			}

			.animate-wiggle {
				animation: wiggle 0.2s 3;
				animation-fill-mode: forwards;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {

	error = '';

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private db: FirebaseExtendedService,
		private cdRef: ChangeDetectorRef,
	) {
		this.generateUrl();
	}

	async generateUrl(): Promise<void> {
		this.error = '';
		this.cdRef.markForCheck();

		const startHref = this.document.location.href;
		const returnUrl = startHref.split('/').slice(0, -1).join('/');
		const fn = this.db.callFunction<{ returnUrl: string }, { url: string }>('ext-firestore-stripe-payments-createPortalLink', 'europe-west1', 1);

		try {
			const { data } = await fn({ returnUrl });

			if (startHref === this.document.location.href)
				this.document.location.href = data.url;
			else console.warn('Customer portal URL redirection - ABORTED');
		} catch (err) {
			console.error(err);
			this.error = 'Unable to generate your Customer Billing Portal. Try again later or contact support.';
			this.cdRef.markForCheck();
		}
	}

}
