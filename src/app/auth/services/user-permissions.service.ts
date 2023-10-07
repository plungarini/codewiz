import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

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
	hasAllPermissions(requiredPermissions: string[], uid?: string): Promise<boolean> {
		return firstValueFrom(this.hasAllPermissions$(requiredPermissions, uid));
	}
	
	/**
	 * Returns an Observable<boolean> indicating whether the user has all the required permissions.
	 *
	 * @param {string[]} requiredPermissions - An array of strings representing the permissions the user needs.
	 * @throws {Error} Throws an error if the requiredPermissions parameter is not valid.
	 * @return {Observable<boolean>} An Observable of type boolean indicating whether the user has all the required permissions.
	 */
	hasAllPermissions$(requiredPermissions: string[], uid?: string): Observable<boolean> {
		if (!requiredPermissions || requiredPermissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		return this.getPermissions$(uid).pipe(map(p => requiredPermissions.every(r => p.includes(r))));
	}

	/**
	 * Checks if the user has any of the required permissions.
	 *
	 * @param {string[]} requiredPermissions - The list of required permissions.
	 * @return {Observable<boolean>} A boolean observable indicating if the user has any of the required permissions.
	 */
	hasAnyPermission$(requiredPermissions: string[], uid?: string): Observable<boolean> {
		if (!requiredPermissions || requiredPermissions.length <= 0) throw new Error('Permissions are invalid for this route.');
		return this.getPermissions$(uid).pipe(map(p => requiredPermissions.some(r => p.includes(r))))
	}
	

	/**
	 * Retrieves permissions and returns them as a Promise of an array of strings.
	 *
	 * @return {Promise<string[]>} A Promise of an array of strings that represent the permissions
	 * retrieved.
	 */
	getPermissions(uid?: string): Promise<string[]> {
		return firstValueFrom(this.getPermissions$(uid));
	}

	/**
	 * Retrieves permissions as an Observable of an array of strings.
	 *
	 * @return {Observable<string[]>} An Observable that emits an array of strings, representing the user's permissions.
	 */
	getPermissions$(uid?: string): Observable<string[]> {
		return this._getCurrentUid$(uid).pipe(
			switchMap(uid => {
				if (!uid) return of([]);
				return this.db.getDoc<{ permissions: string[] }>(`users/${uid}/protected/role`)
					.pipe(map(r => r?.permissions ?? []));
			})
		)
	}

	/**
	 * Sets the permissions for a user.
	 *
	 * @param {string} uid - The user ID.
	 * @param {string[]} permissions - The list of permissions to set.
	 * @return {Promise<void>} - A promise that resolves when the permissions are set.
	 */
	async setPermissions(uid: string, permissions: string[]): Promise<void> {
		const currentPermissions = (await this.getPermissions(uid) ?? []).map((p) => p.trim().toLowerCase());
		const normPermissions = permissions.map((p) => p.trim().toLowerCase());
		if (normPermissions.includes('admin')) throw new Error('Admin permissions are not allowed.');
		const unique = new Set([...currentPermissions, ...normPermissions]);
		await this.db.upsert(`users/${uid}/protected/role`, { permissions: [...unique] });
	}

	/**
	 * Removes the specified permissions from a user.
	 *
	 * @param {string} uid - The unique identifier of the user.
	 * @param {string[]} permissions - An array of permissions to be removed.
	 * @return {Promise<void>} - A promise that resolves when the permissions are removed.
	 */
	async removePermissions(uid: string, permissions: string[]): Promise<void> {
		const currentPermissions = (await this.getPermissions(uid) ?? []).map((p) => p.trim().toLowerCase());
		const normPermissions = permissions.map((p) => p.trim().toLowerCase());
		if (normPermissions.includes('admin')) throw new Error('Admin permissions are not allowed.');
		const unique = new Set([...currentPermissions, ...normPermissions]);
		
		for (const permission of permissions) {
			if (!unique.has(permission)) continue;
			unique.delete(permission);
		}

		await this.db.upsert(`users/${uid}/protected/role`, { permissions: [...unique] });
	}

	private _getCurrentUid$ = (uid?: string) => uid ? of(uid) : this.users.fireUser$.pipe(map(u => u?.uid));
}
