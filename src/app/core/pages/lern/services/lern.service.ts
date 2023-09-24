import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { limit, orderBy } from '@angular/fire/firestore';
import { combineLatest, firstValueFrom, lastValueFrom, map, Observable, of, switchMap } from 'rxjs';
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

	getAll(limitRes?: number): Observable<LernCourse[]> {
		return this._getCurrentUserId$().pipe(
			switchMap((uid) => {
				if (!uid) of([]);
				return this.db.getCol<LernCourse>(
					`lern/${uid}/courses`,
					'id',
					orderBy('updatedAt', 'desc'),
					limit(limitRes ?? 1000)
				);
			}),
			switchMap((courses) => {
				if (courses.length <= 0) return of([]);
				const observables: Observable<LernCourse>[] = courses.map(course => {
					return this.db.getDoc<LernCourse['generation']>(
						`lern/${course.owner}/courses/${course.id}/generation/status`,
					).pipe(
						map(gen => ({ ...course, generation: gen }) as LernCourse),
					);
				});
				return combineLatest(observables);
			}),
			map((courses) => {
				const unified = courses.flat();
				const sorted = [...unified].sort((a, b) => {
					return (b.updatedAt || new Date()).toDate().getTime() - (a.updatedAt || new Date()).toDate().getTime();
				}).slice(0, limitRes);
				return sorted;
			})
		)
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
				url: `/app/lern/setup/${id}/search`,
			};
		} catch (err) {
			console.error(err);
			return {
				error: {
					msg: 'You can\'t create a course right now. Check your credits and if this issue persists, reach out to the support.',
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
