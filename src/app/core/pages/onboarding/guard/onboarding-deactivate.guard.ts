import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { OnboardingData } from '../models/onboarding.model';

export const DeactiveOnboardingGuard: CanDeactivateFn<unknown> = () => {
	const db = inject(FirebaseExtendedService);
	const users = inject(UsersService);
	return users.fireUser$.pipe(
		switchMap(u => {
			if (!u?.uid) return of(false);
			return db.getDoc<OnboardingData>(`users/${u.uid}/onboarding/data`).pipe(
				map((res) => {
					return !!res?.onboarded;
				})
			)
		})
	)
};
