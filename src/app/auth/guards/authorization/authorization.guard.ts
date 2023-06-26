import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';
import { UsersService } from '../../services/users.service';


export const AuthorizationGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  return usersService.user$.pipe(
    map(user => {
      if (!user) {
        return false;
      }

      const requiredPermissions = route.data['permissions'] as string[];
      const failUrl = route.data['failUrl'] as string;
      const isAuthorized = authService.checkAuthorization(user, requiredPermissions);

      if (isAuthorized) {
        return true;
      }

      router.navigateByUrl(failUrl || '/app/home');
      return false;
    })
  );
}
