import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StripeProduct } from '../models/stripe.model';
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
}
