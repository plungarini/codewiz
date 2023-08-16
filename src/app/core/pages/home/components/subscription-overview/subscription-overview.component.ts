import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StripeSubscription } from 'functions/src/models/subscription/subscription.model';
import { of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { StripeProduct } from 'src/app/shared/models/stripe.model';
import { StripeService } from 'src/app/shared/services/stripe.service';

@Component({
  selector: 'app-subscription-overview',
  templateUrl: './subscription-overview.component.html',
  styles: [
    `
      :host {
        @apply block h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionOverviewComponent {

	user$ = this.usersService.user$;
	product$ = this.user$.pipe(
		switchMap((u) => {
			const productId = u?.subscriptions?.at(0)?.items?.at(0)?.plan?.product;
			if (!productId) return of(undefined);
			return this.stripeService.getProduct(productId);
		})
	);

	constructor(
		private usersService: UsersService,
		private stripeService: StripeService,
	) { }

	getRemainingDays(subscription?: StripeSubscription) {
		if (!subscription) return 0;
		const diff = subscription?.current_period_end?.toDate()?.getTime() - new Date().getTime();
		const days = diff / (1000 * 60 * 60 * 24);
		return parseInt(days + '');
	}

	getRemainingDaysPerc(subscription?: StripeSubscription) {
		if (!subscription) return 0;
		const periodStart = subscription?.current_period_start?.toDate();
		const periodEnd = subscription?.current_period_end?.toDate();
		const today = new Date();

		if (!periodStart || !periodEnd) return 0;
		
		const totalDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
		const daysPassed = (today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);

		if (daysPassed < 0 || daysPassed > totalDays) {
			return 0;
		}

		const percentagePassed = (daysPassed / totalDays) * 100;

		const perc = Math.round(percentagePassed * 100) / 100;
		return perc;
	}

	getPlanName(product: StripeProduct): string {
		return product?.name.replace('Annual', '').replace('Plan', '').trim() || '';
	}

}
