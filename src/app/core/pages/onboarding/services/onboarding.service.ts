import { Injectable } from '@angular/core';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { OnboardingData } from '../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

	constructor(
		private db: FirebaseExtendedService,
		private usersService: UsersService,
	) { }

	async updateDetails(data: Partial<OnboardingData>) {
		const uid = await this._getCurrentId();
		if (!uid) throw new Error('User not logged in correctly.');
		return this.db.upsert(`users/${uid}/onboarding/data`, data);
	}

	private async _getCurrentId(): Promise<string | undefined> {
		return (await this.usersService.getCurrentFire())?.uid;
	}

}
