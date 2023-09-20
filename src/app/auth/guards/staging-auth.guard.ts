import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserPermissionsService } from '../services/user-permissions.service';

export const StagingAuthGuard: CanActivateFn = (route, state) => {
	if (environment.production) return of(true);

	const permissionsService = inject(UserPermissionsService);
	const router = inject(Router);
	const requires = ['admin', 'staging'];

	return permissionsService.hasAnyPermission$(requires)
		.pipe(
			tap((canActivate) => {
				if (!canActivate) {
					console.error(`You are not allowed to access this page, you need any of the following permissions: "${requires.join(', ')}"`);
					router.navigate(['/auth/login'], {
						queryParams: {
							returnUrl: state.url,
						},
					});
				}
			})
		);
};
