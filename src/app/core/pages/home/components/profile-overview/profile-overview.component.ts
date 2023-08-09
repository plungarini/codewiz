import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { CompletionStat } from 'src/app/shared/models/chat-stats.model';
import { StripeProduct } from 'src/app/shared/models/stripe.model';
import { UserSubscriptionService } from 'src/app/shared/services/stripe.service';
import { UserUsagesService } from 'src/app/shared/services/user-usages.service';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileOverviewComponent {

	user$ = this.usersService.user$;
	fireUser$ = this.usersService.fireUser$;
	stats$ = this.userStats.getUsage();
	product$ = this.user$.pipe(
		switchMap((u) => {
			const productId = u?.subscriptions?.at(0)?.items?.at(0)?.plan?.product;
			if (!productId) return of(undefined);
			return this.userSubscriptions.getProduct(productId);
		})
	);

	constructor(
		private usersService: UsersService,
		private userSubscriptions: UserSubscriptionService,
		private userStats: UserUsagesService,
	) { }
	
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

}
