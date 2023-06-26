import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { SelectedDocs } from 'src/app/shared/models/select-docs.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Embedding } from './models/embedding.model';
import { EmbeddingsService } from './services/embeddings.service';

@Component({
  templateUrl: './repo-details.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoDetailsComponent {

	repo$: Observable<SelectedDocs | undefined>;
	embeddings: Embedding[] = [];
	loadingError = '';
	cacheId: string = '';
	loading = false;

	constructor(
		private route: ActivatedRoute,
		private db: FirebaseExtendedService,
		private embeddingsService: EmbeddingsService,
		private cdRef: ChangeDetectorRef,
	) {
		this.repo$ = this.route.paramMap.pipe(
			switchMap((paramMap) => {
				const id = (paramMap.get('id') || '').trim();
				if (!id) return of(undefined);
				/* this.loadEmbeddings(id); */
				return this.db.getDoc<SelectedDocs>(`supported-docs/${id}`);
			})
		);
	}

	/* async loadEmbeddings(repo: string): Promise<void> {
		if (this.cacheId == repo) return;
		this.cacheId = repo;
		this.loading = true;
		this.cdRef.detectChanges();

		try {
			this.embeddings = await this.embeddingsService.getEmbeddings(repo);
		} catch (err) {
			this.loadingError = 'Error loading embeddings... Check console.';
		} finally {
			this.loading = false;
			this.cdRef.detectChanges();
		}
	} */

}
