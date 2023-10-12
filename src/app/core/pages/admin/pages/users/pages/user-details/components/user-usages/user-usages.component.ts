import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { StripeProduct } from 'src/app/shared/models/stripe.model';
import { StripeService } from 'src/app/shared/services/stripe.service';
import { UserUsagesService } from 'src/app/shared/services/user-usages.service';

@Component({
  selector: 'app-user-usages',
  templateUrl: './user-usages.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserUsagesComponent {

	@Input('user') set setUser(value: User | undefined) {
		this._user$.next(value);
	}

	private _user$: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

	totalPrompts$ = this._user$.pipe(switchMap((u) => this.usages.getTotalPrompts(u?.id)));
	usedPrompts$ = this._user$.pipe(switchMap((u) => this.usages.getThisPeriodPrompts(u?.id)));
	promptCredits$ = this._user$.pipe(switchMap((u) => this.usages.getAdditionalPromptCredits(u?.id)));

	totalLerns$ = this._user$.pipe(switchMap((u) => this.usages.getTotalLern(u?.id)));
	usedLerns$ = this._user$.pipe(switchMap((u) => this.usages.getThisPeriodLern(u?.id)));
	lernCredits$ = this._user$.pipe(switchMap((u) => this.usages.getAdditionalLernCredits(u?.id)));

	product$ = this._user$.pipe(
		switchMap((u) => {
			const productId = u?.subscriptions?.at(0)?.items?.at(0)?.plan?.product;
			return this.stripeService.getProduct(productId);
		})
	);

	constructor(
		private usages: UserUsagesService,
		private stripeService: StripeService,
	) { }

	getRemainingQueries(used?: number | null, product?: null | StripeProduct, credits?: number | null) {
		if (used === undefined || used === null || !product) return 0;
		return (parseInt(product.metadata.maxPromptCountMonth ?? '0') + (credits ?? 0)) - used;
	}

	getRemainingLerns(used?: number | null, product?: StripeProduct | null, credits?: number | null) {
		if (used === undefined || used === null || !product) return 0;
		const remaining = (parseInt(product.metadata.maxLernCountMonth ?? '0') + (credits ?? 0)) - used;
		return remaining <= 0 ? 0 : remaining;
	}

}
