import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StripeSubscription } from 'functions/src/models/subscription/subscription.model';
import { switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { CompletionStat } from 'src/app/shared/models/chat-stats.model';
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
	stats$ = this.userStats.getUsage();
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

	getRemainingQueries(usage?: null | CompletionStat[], product?: null | StripeProduct) {
		if (!usage || !product) return 0;
		const totalCount = usage.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b.prompt.count) ? 0 : b.prompt.count), 0);
		return (parseInt(product.metadata.maxPromptCountMonth || '0')) - totalCount;
	}

	getRemainingQueriesPerc(usage?: null | CompletionStat[], product?: null | StripeProduct) {
		if (!usage || !product) return 0;
		const totalCount = usage.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b.prompt.count) ? 0 : b.prompt.count), 0);
		return (totalCount / parseInt(product.metadata.maxPromptCountMonth || '0')) * 100;
	}

	getPlanName(product: StripeProduct): string {
		return product?.name.replace('Annual', '').replace('Plan', '').trim() || '';
	}

	getTotalQueries(product: StripeProduct): number {
		return parseInt(product.metadata.maxPromptCountMonth || '0');
	}

	getUsedQueries(usage?: null | CompletionStat[]) {
		if (!usage) return 0;
		const totalCount = usage.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b.prompt.count) ? 0 : b.prompt.count), 0);
		return totalCount;
	}

}
