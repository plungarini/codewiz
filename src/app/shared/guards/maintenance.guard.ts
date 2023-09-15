import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';
import { MaintenanceService } from '../services/maintenance.service';

export const MaintenanceGuard: CanActivateFn = (route, state) => {
	const permissionsService = inject(UserPermissionsService);
	const maintenanceService = inject(MaintenanceService);
	const router = inject(Router);
	
	return maintenanceService.getStatus().pipe(
		map((status) => {
			return !!status?.maintenance.active;
		}),
		switchMap((active) => {
			return active ? permissionsService.hasAllPermissions$(['admin']) : of(true);
		}),
		tap((canActivate) => {
			if (!canActivate) {
				console.warn('App is under maintenance.');
				router.navigate(['/app/maintenance']);
			}
		})
	);
};
