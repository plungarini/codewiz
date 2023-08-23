import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
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

	products$ = this.stripe.getAllProducts().pipe(
		map(products => {
			return {
				apprentice: {
					monthly: products.find(product => product.role?.includes('apprentice') && !product.role?.includes('annual')),
					yearly: products.find(product => product.role?.includes('apprentice') && product.role?.includes('annual'))
				},
				wizard: {
					monthly: products.find(product => product.role?.includes('wizard') && !product.role?.includes('annual')),
					yearly: products.find(product => product.role?.includes('wizard') && product.role?.includes('annual'))
				},
				master: {
					monthly: products.find(product => product.role?.includes('master') && !product.role?.includes('annual')),
					yearly: products.find(product => product.role?.includes('master') && product.role?.includes('annual'))
				}
			}
		})
	)

	constructor(
		private stripe: StripeService,
	) { }

	toggleTimeframe(time: 'monthly' | 'yearly') {
		this.timeframe$.next(time);
	}

}
