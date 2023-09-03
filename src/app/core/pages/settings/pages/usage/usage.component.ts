import { ChangeDetectionStrategy, Component } from '@angular/core';
import { switchMap } from 'rxjs';
import { StripeSubscription } from 'src/app/auth/models/subscription.model';
import { UsersService } from 'src/app/auth/services/users.service';
import { StripeProduct } from 'src/app/shared/models/stripe.model';
import { StripeService } from 'src/app/shared/services/stripe.service';
import { UserUsagesService } from 'src/app/shared/services/user-usages.service';



@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageComponent {

	user$ = this.usersService.user$;
	fireUser$ = this.usersService.fireUser$;
	usedPrompts$ = this.userStats.getThisPeriodPrompts();
	product$ = this.user$.pipe(
		switchMap((u) => {
			const productId = u?.subscriptions?.at(0)?.items?.at(0)?.plan?.product;
			return this.stripeService.getProduct(productId);
		})
	);

	constructor(
		private usersService: UsersService,
		private stripeService: StripeService,
		private userStats: UserUsagesService,
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

	getRemainingQueries(used?: number | null, product?: null | StripeProduct) {
		if (used === undefined || used === null || !product) return 0;
		return (parseInt(product.metadata.maxPromptCountMonth || '0')) - used;
	}

	getRemainingQueriesPerc(used?: number | null, product?: null | StripeProduct) {
		if (used === undefined || used === null || !product) return 0;
		return (used / parseInt(product.metadata.maxPromptCountMonth || '0')) * 100;
	}

	getPlanName(product: StripeProduct): string {
		return product?.name.replace('Annual', '').replace('Plan', '').trim() || '';
	}

	getTotalQueries(product: StripeProduct): number {
		return parseInt(product.metadata.maxPromptCountMonth || '0');
	}

}
