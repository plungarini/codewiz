import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { tap } from 'rxjs';
import { UserPermissionsService } from '../services/user-permissions.service';


export const PermissionsGuard: CanActivateFn = (route, state) => {
	const permissionsService = inject(UserPermissionsService);
	const router = inject(Router);

	return permissionsService.checkPermissions$(route.data['permissions'])
		.pipe(
			tap((canActivate) => {
				if (!canActivate) {
					router.navigate(['/app'], {
						queryParams: {
							returnUrl: state.url,
						},
					});
				}
			})
		);
}
