import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { OnboardingData } from '../models/onboarding.model';

export const ActiveOnboardingGuard: CanActivateFn = async (route, state) => {
	const db = inject(FirebaseExtendedService);
	const users = inject(UsersService);
	const router = inject(Router);

	const fireUser = await firstValueFrom(users.fireUser$);
	if (!fireUser?.uid) return false;

	const doc = db.getDoc<OnboardingData>(`users/${fireUser.uid}/onboarding/data`).pipe(
		map((res) => {
			const can = !!res?.onboarded;
			if (!can) router.navigate(['/app/setup']);
			return can;
		})
	);

	return firstValueFrom(doc);
};
