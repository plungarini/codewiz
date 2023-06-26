import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

	private user = this.users.user$;

	constructor(
		private users: UsersService,
		private db: FirebaseExtendedService
	) { }
	
	async checkPermissions(requiredPermissions: string[]): Promise<boolean> {
		if (!requiredPermissions || requiredPermissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		const u = await firstValueFrom(this.user);
		if (!u) throw new Error('User is not defined, unable to check permissions');
		return !!u.permissions?.some(p => requiredPermissions.includes(p));
	}
	
	checkPermissions$(requiredPermissions: string[]): Observable<boolean> {
		if (!requiredPermissions || requiredPermissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		return this.user.pipe(map(u => !!u?.permissions?.some(p => requiredPermissions.includes(p))));
	}

	async setPermissions(permissions: string[] = ['customer']): Promise<void> {
		if (!permissions || permissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		const ref = await firstValueFrom(this.user.pipe(map(u => u && u.id ? `users/${u.id}/protected/role` : undefined)));
		if (!ref) throw new Error('UID is not defined, unable to set permissions');
		try {
			await this.db.upsert(ref, { permissions });
		} catch (err) {
			console.error(err);
		}
	}
}
