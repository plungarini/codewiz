import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Repo } from '../../../../../../../shared/models/repo.model';

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
	repoId: string = '';

	constructor(
		private route: ActivatedRoute,
		private db: FirebaseExtendedService,
	) {
		this.repo$ = this.route.paramMap.pipe(
			switchMap((paramMap) => {
				const id = (paramMap.get('id') || '').trim();
				this.repoId = id;
				if (!id) return of(undefined);
				return this.db.getDoc<Repo>(`supported-docs/${id}`);
			})
		);
	}

}
