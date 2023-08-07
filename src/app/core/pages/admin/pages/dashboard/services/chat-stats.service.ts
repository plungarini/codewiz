import { Injectable } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { combineLatest, filter, map, Observable, of, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { CompletionStat, RepoStat } from '../models/chat-stats.model';

@Injectable({
  providedIn: 'root'
})
export class ChatStatsService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getChatStatByRepo(repo?: string): Observable<RepoStat | undefined> {
		if (!repo) return of(undefined)
		return this.db.getDoc<CompletionStat>(`stats/completions/repos/${repo}`).pipe(
			switchMap((stat) => {
				return this.db.getCol<CompletionStat>(`stats/completions/repos/${repo}/byDate`, 'id', orderBy('createdAt')).pipe(
					map((date) => ({ ...stat, history: date }))
				);
			}),
		)
	}

	getAllChatStats(): Observable<RepoStat[]> {
		return this.db.getCol<RepoStat>('/stats/completions/repos', 'id', orderBy('prompt.count', 'desc')).pipe(
			switchMap(users => {
				const observables = users
					.filter(user => !!user.id)
					.map(user =>
						this.getChatStatByRepo(user.id)
					);
				return combineLatest(observables);
			}),
			filter(stat => !!stat),
			map((stats) => stats as RepoStat[])
		)
	}
}
