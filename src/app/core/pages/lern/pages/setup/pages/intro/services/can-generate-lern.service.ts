import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { StripeService } from 'src/app/shared/services/stripe.service';
import { UserUsagesService } from 'src/app/shared/services/user-usages.service';

@Injectable({
  providedIn: 'root'
})
export class CanGenerateLernService {

	private user$ = this.usersService.user$;
	private usedLerns$: Observable<number> = this.userStats.getThisPeriodLern();
	private lernCredits$: Observable<number> = this.userStats.getAdditionalLernCredits().pipe(
		map((credits) => credits.credits ?? 0)
	);
	private product$: Observable<number> = this.user$.pipe(
		switchMap((u) => {
			const productId = u?.subscriptions?.at(0)?.items?.at(0)?.plan?.product;
			return this.stripeService.getProduct(productId);
		}),
		map((product) => {
			const num = parseInt(product?.metadata.maxLernCountMonth ?? '0');
			return isNaN(num) ? 0 : num;
		})
	);

	constructor(
		private usersService: UsersService,
		private stripeService: StripeService,
		private userStats: UserUsagesService,
	) { }

	getCanGenerateLern() {
		return this.usedLerns$.pipe(
			switchMap(() => {
				return combineLatest([this.usedLerns$, this.lernCredits$, this.product$]);
			}),
			map((res) => {
				const used = res[0] ?? 0;
				const credits = res[1] ?? 0;
				const product = res[2] ?? 0;
				const remaining = (product + credits) - (used);
				return remaining > 0;
			})
		)
	}
}
