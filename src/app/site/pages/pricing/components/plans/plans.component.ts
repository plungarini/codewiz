import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { StripeService } from 'src/app/shared/services/stripe.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansComponent {

	timeframe$ = new BehaviorSubject<'monthly' | 'yearly'>('yearly');

	user$ = this.users.user$.pipe(
		tap((user) => {
			if (!user) return;
			this.userSubscriptionRole = user.subscriptions?.at(0)?.role || 'apprentice';
			this.cdRef.markForCheck();
		})
	);
	products$ = this.stripe.getAllProducts().pipe(
		map(products => {
			return {
				apprentice: products.find(product => product.role?.includes('apprentice')),
				wizard: products.find(product => product.role?.includes('wizard')),
				master: products.find(product => product.role?.includes('master')),
			};
		})
	);

	userSubscriptionRole: string = '';

	constructor(
		private stripe: StripeService,
		private users: UsersService,
		private cdRef: ChangeDetectorRef,
	) { }

	toggleTimeframe(time: 'monthly' | 'yearly') {
		this.timeframe$.next(time);
	}

}
