import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { tap } from 'rxjs';
import { UserPermissionsService } from '../services/user-permissions.service';


export const PermissionsGuard: CanActivateFn = (route, state) => {
	const permissionsService = inject(UserPermissionsService);
	const router = inject(Router);
	const requires = route.data['permissions'];

	return permissionsService.hasPermissions$(requires)
		.pipe(
			tap((canActivate) => {
				if (!canActivate) {
					console.error(`You are not allowed to access this page, you need the following permissions: "${requires.join(', ')}"`);
					router.navigate(['/app/unauthorized'], {
						queryParams: {
							returnUrl: state.url,
						},
					});
				}
			})
		);
}
