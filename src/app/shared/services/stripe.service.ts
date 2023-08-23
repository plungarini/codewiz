import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StripeProduct, StripeProductPrice } from '../models/stripe.model';
import { FirebaseExtendedService } from './firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

	private freePlanId = environment.production ? 'prod_OV9WZx4H6x0iOZ' : 'prod_OV9eAd1mDUMCIv';

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getProduct(id?: string) {
		id = id || this.freePlanId;
		return this.db.getDoc<StripeProduct>(`products/${id}`);
	}

	getAllProducts(): Observable<StripeProduct[]> {
		return this.db.getCol<StripeProduct>('products').pipe(
			switchMap(products => {
				const observables = products.map(prod => {
					return this.db.getCol<StripeProductPrice>(`products/${prod.id}/prices`).pipe(
						map((prices) => ({ ...prod, price: prices.filter(p => p.active)[0] }))
					)
				});
				return combineLatest(observables);
			})
		);
	}
}
