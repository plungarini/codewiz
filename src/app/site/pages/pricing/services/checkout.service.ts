import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { filter, firstValueFrom, map } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

	constructor(
		private db: FirebaseExtendedService,
		private router: Router,
		private users: UsersService,
	) { }
	
	async checkout(priceId: string) {
		const uid = await this._getCurrentId();
		if (!uid) {
			this.router.navigate(['/auth/signup'], {
				queryParams: {
					returnUrl: '/pricing',
				},
			})
			return;
		};
		const id = this.db.generateId();

		await this.db.upsert(
			`users/${uid}/checkout_sessions/${id}`,
			{
				price: priceId,
				automatic_tax: true,
				tax_id_collection: true,
				collect_shipping_address: false,
				allow_promotion_codes: true,
				success_url: window.location.origin + '/app',
				cancel_url: window.location.origin + '/pricing',
			}
		);

		const url = await firstValueFrom(
			this.db.getDoc<{ url: string }>(`users/${uid}/checkout_sessions/${id}`).pipe(
				filter((d) => {
					return !!d?.url;
				}),
				map((d) => d?.url)
			)
		);

		return url;
	}

	private async _getCurrentId() {
		return (await this.users.getCurrentFire())?.uid;
	}

}
