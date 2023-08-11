import { Injectable } from '@angular/core';
import { StripeProduct } from '../models/stripe.model';
import { FirebaseExtendedService } from './firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getProduct(id: string) {
		return this.db.getDoc<StripeProduct>(`products/${id}`);
	}
}
