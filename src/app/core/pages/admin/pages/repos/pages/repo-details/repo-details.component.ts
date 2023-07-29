import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Repo } from '../../../../../../../shared/models/repo.model';
import { Embedding } from './models/embedding.model';
import { EmbeddingsService } from './services/embeddings.service';

@Component({
  templateUrl: './repo-details.component.html',
  styles: [
    `
      :host {
      	@apply block h-full max-h-full overflow-y-hidden; 
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoDetailsComponent {

	repo$: Observable<Repo | undefined>;
	embeddings: Embedding[] = [];
	loadingError = '';
	cacheId: string = '';
	loading = false;
	repoId: string = '';
	
	private embeddingsSubject$: BehaviorSubject<Embedding[]> = new BehaviorSubject<Embedding[]>([]);
	embeddings$: Observable<Embedding[]> = this.embeddingsSubject$.asObservable();

	constructor(
		private route: ActivatedRoute,
		private db: FirebaseExtendedService,
		private embeddingsService: EmbeddingsService,
		private cdRef: ChangeDetectorRef,
	) {
		this.repo$ = this.route.paramMap.pipe(
			switchMap((paramMap) => {
				const id = (paramMap.get('id') || '').trim();
				this.repoId = id;
				if (!id) return of(undefined);
				this.loadEmbeddings(id);
				return this.db.getDoc<Repo>(`supported-docs/${id}`);
			})
		);
	}

	async loadEmbeddings(repo: string): Promise<void> {
		if (this.cacheId == repo) return;
		this.cacheId = repo;
		this.loading = true;
		this.cdRef.detectChanges();

		try {
			const embeddings = await this.embeddingsService.getEmbeddings(repo);
			embeddings
				.sort((a, b) => {
					// Convert to uppercase for case-insensitive sorting
					const nameA = a.title.toUpperCase();
					const nameB = b.title.toUpperCase();

					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				})
			this.embeddingsSubject$.next(embeddings);
		} catch (err) {
			this.loadingError = 'Error loading embeddings... Check console.';
		} finally {
			this.loading = false;
			this.cdRef.detectChanges();
		}
	}

}
