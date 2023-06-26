import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { UsersService } from '../../services/users.service';


export const AdminGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  return usersService.user$.pipe(
		take(1),
		map(user => (user && (user.role?.id === 'admin' || user.role?.id === 'super-admin')) ? true : false),
		tap(isAdmin => {
			if (!isAdmin) {
				console.error('Access denied - Admins only');
				router.navigate(['/app']);
			}
		})
	);
}
