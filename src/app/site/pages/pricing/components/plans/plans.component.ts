import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { StripeService } from 'src/app/shared/services/stripe.service';
import { environment } from 'src/environments/environment';

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
			}
		})
	);

	paymentLinks = {
		wizard: {
			monthly: environment.production ? 'https://buy.stripe.com/3cs4gLfWk7bjg8g8ww' : 'https://buy.stripe.com/test_eVa14K4Yi2mp8y48wA',
			yearly: environment.production ? 'https://buy.stripe.com/5kAdRlfWk7bj5tC7st' : 'https://buy.stripe.com/test_9AQ8xc2Qad13g0w8wB',
		},
		master: {
			monthly: environment.production ? 'https://buy.stripe.com/aEU5kPeSg3Z72hq9AC' : 'https://buy.stripe.com/test_3cseVA2Qa2mp29GcMO',
			yearly: environment.production ? 'https://buy.stripe.com/fZe00v5hG9jraNW28b' : 'https://buy.stripe.com/test_3cseVA1M65yBbKg5kn',
		}
	}

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
