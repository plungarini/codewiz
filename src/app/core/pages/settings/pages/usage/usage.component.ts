import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { StripeSubscription } from 'src/app/auth/models/subscription.model';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';
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

	user$ = this.usersService.user$.pipe(
		tap((u) => {
			this.userSub = u?.subscriptions?.filter((s) => s?.status === 'active')?.at(0)?.role ?? 'apprentice';
			this.cdRef.markForCheck();
		})
	);

	isAlphaUser$ = this.permissions.hasAnyPermission$(['alpha']);

	usedLerns$ = this.userStats.getThisPeriodLern();
	lernCredits$ = this.userStats.getAdditionalLernCredits();

	usedPrompts$ = this.userStats.getThisPeriodPrompts();
	promptCredits$ = this.userStats.getAdditionalPromptCredits();

	product$ = this.user$.pipe(
		switchMap((u) => {
			const productId = u?.subscriptions?.at(0)?.items?.at(0)?.plan?.product;
			return this.stripeService.getProduct(productId);
		})
	);

	userSub: string = 'apprentice';

	constructor(
		private cdRef: ChangeDetectorRef,
		private permissions: UserPermissionsService,
		private usersService: UsersService,
		private stripeService: StripeService,
		private userStats: UserUsagesService,
	) {	}

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

	getRemainingQueries(used?: number | null, product?: null | StripeProduct, credits?: number | null) {
		if (used === undefined || used === null || !product) return 0;
		return (parseInt(product.metadata.maxPromptCountMonth ?? '0') + (credits ?? 0)) - used;
	}

	getRemainingQueriesPerc(used?: number | null, product?: null | StripeProduct, credits?: number | null) {
		if (used === undefined || used === null || !product) return 0;
		return (used / (parseInt(product.metadata.maxPromptCountMonth ?? '0') + (credits ?? 0))) * 100;
	}

	getRemainingLerns(used?: number | null, product?: StripeProduct | null, credits?: number | null) {
		if (used === undefined || used === null || !product) return 0;
		const remaining = (parseInt(product.metadata.maxLernCountMonth ?? '0') + (credits ?? 0)) - used;
		return remaining <= 0 ? 0 : remaining;
	}

	getRemainingLernsPerc(used?: number | null, product?: StripeProduct | null, credits?: number | null) {
		if (used === undefined || used === null || !product) return 0;
		const perc = (used / (parseInt(product.metadata.maxLernCountMonth ?? '0') + (credits ?? 0))) * 100;
		return perc >= Infinity ? 100 : perc;
	}

	getTotalLerns(product: StripeProduct): number {
		return parseInt(product.metadata.maxLernCountMonth ?? '0');
	}

	getPlanName(product: StripeProduct): string {
		return product?.name.replace('Annual', '').replace('Plan', '').trim() || '';
	}

	getTotalQueries(product: StripeProduct): number {
		return parseInt(product.metadata.maxPromptCountMonth ?? '0');
	}

}
