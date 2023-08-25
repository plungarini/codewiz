import { Injectable } from '@angular/core';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

	constructor(
		private db: FirebaseExtendedService,
		private users: UsersService,
	) { }
	
	async checkout(priceId: string) {
		const uid = await this._getCurrentId();
		if (!uid) return;
		return this.db.upsert(
			`users/${uid}/checkout_sessions`,
			{
				price: priceId,
				automatic_tax: true,
				tax_id_collection: true,
				collect_shipping_address: false,
				allow_promotion_codes: true,
				success_url: window.location.origin,
    		cancel_url: window.location.origin,
			}
		)
	}

	private async _getCurrentId() {
		return (await this.users.getCurrentFire())?.uid;
	}

}
