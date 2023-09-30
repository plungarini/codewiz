import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { limit, orderBy } from '@angular/fire/firestore';
import { combineLatest, firstValueFrom, lastValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { environment } from 'src/environments/environment';
import { LernCourse, LernCourseRequest, LernCourseSectionData, LernCourseSectionDataProgress, SearchDocsResponse } from '../models/course.model';

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
		).pipe(
			map((res) => {
				if (res.suggested === repoTable) {
					return { can: res.can, pages: res.pages }
				} else {
					return res;
				}
			})
		);

		return await lastValueFrom(req$);
	}

	getAll(limitRes?: number): Observable<LernCourseRequest[]> {
		return this._getCurrentUserId$().pipe(
			switchMap((uid) => {
				if (!uid) of([]);
				return this.db.getCol<LernCourseRequest>(
					`lern/${uid}/courses`,
					'id',
					orderBy('updatedAt', 'desc'),
					limit(limitRes ?? 1000)
				);
			}),
			switchMap((courses) => {
				if (courses.length <= 0) return of([]);
				const observables: Observable<LernCourseRequest>[] = courses.map(course => {
					return this.db.getDoc<LernCourseRequest['generation']>(
						`lern/${course.owner}/courses/${course.id}/generation/status`,
					).pipe(
						map(gen => ({ ...course, generation: gen }) as LernCourseRequest),
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

	getSections(id?: string): Observable<LernCourseSectionData[]> {
		return this._getCurrentUserId$().pipe(
			switchMap((uid) => {
				if (!uid || !id) return of(undefined);
				return this.db.getCol<{ goals: string[]; shortDescription: string; order: number; id: string }>(
					`lern/${uid}/courses/${id}/sections`
				).pipe(
					map(sections => ({
						sections,
						uid,
					}))
				);
			}),
			switchMap((res) => {
				if (!res) return of([]);
				const observables = res.sections.map((section) => {
					return this.db.getDoc<LernCourseSectionData>(
						`lern/${res.uid}/courses/${id}/sections/${section.id}/generation/data`
					).pipe(
						switchMap((data) => {
							return this.db.getDoc<LernCourseSectionDataProgress>(
								`lern/${res.uid}/courses/${id}/sections/${section.id}/progress/data`
							).pipe(
								map((progress) => ({
									...data,
									progress
								}))
							)
						}),
						map((data) => ({
							...section,
							...data,
							id: section.id,
						}) as LernCourseSectionData)
					)
				});

				return combineLatest(observables);
			}),
		)
	}

	getFullCourse(id: string | null) {
		return this._getCurrentUserId$().pipe(
			switchMap((uid) => {
				if (!uid || !id) return of(undefined);
				return this.db.getDoc<LernCourseRequest>(`lern/${uid}/courses/${id}`);
			}),
			switchMap((course) => {
				if (!course) return of({ course, plan: undefined });
				return this.db.getDoc<LernCourse['plan']>(`lern/${course?.owner}/courses/${id}/plan/data`).pipe(
					map(plan => ({
						course,
						plan
					})),
				);
			}),
			switchMap(({ course, plan }) => {
				if (!course || !plan) return of(undefined);
				return this.getSections(course.id).pipe(
					map(sections => ({
						id: course.id,
						plan,
						overview: course,
						sections,
					}) as LernCourse)
				);
			})
		)
	}

	getCourseRequest(id: string) {
		return this._getCurrentUserId$().pipe(
			switchMap((uid) => {
				if (!uid || !id) return of(undefined);
				return this.db.getDoc<LernCourseRequest>(`lern/${uid}/courses/${id}`);
			})
		)
	}

	async updateCourse(id: string, course: Partial<LernCourseRequest>): Promise<void> {
		const uid = await this._getCurrentUserId();
		if (!uid || !id) return;
		await this.db.upsert<LernCourseRequest>(`lern/${uid}/courses/${id}`, course);
	}

	async createNewCourse(repo: string): Promise<CreateCourseResponse> {
		try {
			const uid = await this._getCurrentUserId();
			if (!uid) return {
				error: { msg: 'You need to be logged in to create a course.', details: null }
			};

			const id = this.db.generateId();
			const course: Partial<LernCourseRequest> = {
				id,
				repo,
				owner: uid,
				name: 'New Course',
				status: 'private',
			};
			await this.db.upsert<LernCourseRequest>(
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
