import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';



@Injectable({
	providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {

	constructor(private auth: AuthenticationService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.auth.user$.pipe(
			map(user => {
				if (!user) return false;

				const requiredPermissions = route.data['permissions'] as string[];
				const failUrl = route.data['failUrl'] as string;
				const isAuthorized = this.auth.checkAuthorization(user, requiredPermissions);

				if (isAuthorized) return true;

				this.router.navigateByUrl(failUrl || '/app/home');
				return false;
			})
		);
	}
}
