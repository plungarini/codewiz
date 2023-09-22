import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom, map, of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { environment } from 'src/environments/environment';
import { LernCourse, SearchDocsResponse } from '../models/course.model';

type CreateCourseResponse = {
	url?: string;
	error?: {
		msg: string;
		details: any;
	};
};

@Injectable({
  providedIn: 'root'
})
export class LernService {

	production = false;

	constructor(
		private users: UsersService,
		private db: FirebaseExtendedService,
		private http: HttpClient,
	) {
		this.production = false;
		try {
			this.production = eval(environment.production)
		} catch (err) {
			this.production = false;
			console.error(err);
		}
	}
	
	async searchDocs(query: string, repoTable: string, availableRepos: string[]) {
		const uid = await this._getCurrentUserId();
		const req$ = this.http.post<SearchDocsResponse>(
			`https://${environment.supabase.projectRef}.supabase.co/functions/v1/lern-search-docs`,
			{
				query,
				uid,
				repo: repoTable,
				availableRepos,
				environment: this.production ? 'production' : 'development',
			},
			{
				headers: {
					apikey: environment.supabase.anonKey,
					Authorization: `Bearer ${environment.supabase.anonKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		return await lastValueFrom(req$);
	}

	getCourse(id: string) {
		return this._getCurrentUserId$().pipe(
			switchMap((uid) => {
				if (!uid || !id) return of(undefined);
				return this.db.getDoc<LernCourse>(`lern/${uid}/courses/${id}`);
			})
		)
	}

	async updateCourse(id: string, course: Partial<LernCourse>): Promise<void> {
		const uid = await this._getCurrentUserId();
		if (!uid || !id) return;
		await this.db.upsert<LernCourse>(`lern/${uid}/courses/${id}`, course);
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
