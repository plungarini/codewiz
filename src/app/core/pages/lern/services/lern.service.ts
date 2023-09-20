import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { environment } from 'src/environments/environment';
import { LernCourse } from '../models/course.model';

type CreateCourseResponse = {
	url?: string;
	error?: {
		msg: string;
		details: any;
	};
}

@Injectable({
  providedIn: 'root'
})
export class LernService {

	constructor(
		private users: UsersService,
		private db: FirebaseExtendedService,
		private http: HttpClient,
	) { }
	
	async searchDocs(query: string) {
		const res = await firstValueFrom(this.http.post(
			`https://${environment.supabase.projectRef}.functions.supabase.co/lern-prompt`,
			{
				query,
				uid: 'BKKPiwMy5bhkXOS5BkL9ZCSwXTj1',
				repo: 'angular',
				environment: environment.production ? 'production' : 'development',
			},
			{
				headers: {
					apikey: environment.supabase.anonKey,
					Authorization: `Bearer ${environment.supabase.anonKey}`,
					'Content-Type': 'application/json',
				},
			}
		));

		return res;
	}

	async createNewCourse(repo: string): Promise<CreateCourseResponse> {
		try {
			const uid = await this._getCurrentUserId();
			if (!uid) return {
				error: { msg: 'You need to be logged in to create a course.', details: null }
			};

			const id = this.db.generateId();
			const course: Partial<LernCourse> = {
				id,
				repo,
				owner: uid,
				name: 'New Course',
				status: 'private',
			};
			await this.db.upsert<LernCourse>(
				`lern/${uid}/courses/${id}`,
				course
			);
			return {
				url: `/app/lern/setup/${id}/intro`,
			};
		} catch (err) {
			console.error(err);
			return {
				error: {
					msg: 'You can create a course right now. Check your credits and if this issue persists, reach out to the support.',
					details: err,
				}
			};
		}
	}

	private _getCurrentUserId$() {
		return this.users.fireUser$.pipe(map(u => u?.uid))
	}

	private _getCurrentUserId() {
		return firstValueFrom(this._getCurrentUserId$());
	}
}
