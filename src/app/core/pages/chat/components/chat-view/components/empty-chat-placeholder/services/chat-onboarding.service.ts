import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class ChatOnboardingService {

	constructor(
		private users: UsersService,
		private db: FirebaseExtendedService,
	) { }

	getOnboardingPreference() {
		return this.users.user$.pipe(map((u) => !!u?.hideChatOnboarding))
	}

	async setOnboardingPreference(hide: boolean) {
		const uid = await this._getCurrentUid();
		if (!uid) return;
		await this.db.upsert<User>(`/users/${uid}`, { hideChatOnboarding: hide });
	}

	private _getCurrentUid$() {
		return this.users.fireUser$.pipe(map((u) => u?.uid));
	}

	private _getCurrentUid() {
		return firstValueFrom(this._getCurrentUid$());
	}
}
