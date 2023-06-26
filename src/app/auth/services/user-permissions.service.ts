import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
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
	
	/**
	 * Returns a Promise that resolves to a boolean indicating whether the user has the required permissions.
	 *
	 * @param {string[]} requiredPermissions - An array of strings representing the required permissions.
	 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the user has the required permissions.
	 */
	checkPermissions(requiredPermissions: string[]): Promise<boolean> {
		return firstValueFrom(this.checkPermissions$(requiredPermissions));
	}
	
	/**
	 * Returns an Observable<boolean> indicating whether the user has all the required permissions.
	 *
	 * @param {string[]} requiredPermissions - An array of strings representing the permissions the user needs.
	 * @throws {Error} Throws an error if the requiredPermissions parameter is not valid.
	 * @return {Observable<boolean>} An Observable of type boolean indicating whether the user has all the required permissions.
	 */
	checkPermissions$(requiredPermissions: string[]): Observable<boolean> {
		if (!requiredPermissions || requiredPermissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		return this.getPermissions$().pipe(map(p => requiredPermissions.every(r => p.includes(r))));
	}

	/**
	 * Retrieves permissions and returns them as a Promise of an array of strings.
	 *
	 * @return {Promise<string[]>} A Promise of an array of strings that represent the permissions
	 * retrieved.
	 */
	getPermissions(): Promise<string[]> {
		return firstValueFrom(this.getPermissions$());
	}

	/**
	 * Retrieves permissions as an Observable of an array of strings.
	 *
	 * @return {Observable<string[]>} An Observable that emits an array of strings, representing the user's permissions.
	 */
	getPermissions$(): Observable<string[]> {
		return this.user.pipe(
			switchMap(u => {
				if (!u || !u?.id) return of([]);
				return this.db.getDoc<{ permissions: string[] }>(`users/${u.id}/protected/role`)
					.pipe(map(r => r?.permissions || []));
			})
		)
	}

	/**
	 * Sets the permissions for the user and updates the database.
	 *
	 * @param {string[]} permissions - An array of strings representing the permissions to be set. Defaults to ['customer'] if not provided.
	 * @return {Promise<void>} A Promise that resolves when the permissions have been successfully set in the database.
	 * @throws {Error} Will throw an error if permissions are invalid for this route or if UID is not defined and unable to set permissions.
	 */
	async setPermissions(permissions: string[] = ['authenticated']): Promise<void> {
		if (!permissions || permissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		const ref = await firstValueFrom(this.user.pipe(map(u => u && u.id ? `users/${u.id}/protected/role` : undefined)));
		if (!ref) throw new Error('UID is not defined, unable to set permissions');
		try {
			const currentArr = (await firstValueFrom(this.user))?.permissions || [];
			const normPermissions = new Set([
				currentArr.map(p => p.toLowerCase().trim()),
				...permissions.map(p => p.toLowerCase().trim())
			]);
			await this.db.upsert(ref, { permissions: normPermissions });
		} catch (err) {
			console.error(err);
		}
	}
}
