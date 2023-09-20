import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { UsersService } from '../services/users.service';


export const AuthGuard: CanActivateFn = (route, state) => {
	const usersService = inject(UsersService);
	const router = inject(Router);

	return usersService.user$.pipe(
    map((user) => !!user),
    tap((loggedIn) => {
      if (!loggedIn) {
        router.navigate(['/auth/login'], {
          queryParams: {
            returnUrl: state.url,
          },
        });
      }
    })
  )};
