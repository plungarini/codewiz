import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Repo } from '../../../../../../../shared/models/repo.model';

@Component({
  templateUrl: './repos-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposListComponent {

	repos: Observable<Repo[]>;

	constructor(
		private db: FirebaseExtendedService,
	) {
		this.repos = this.db.getCol<Repo>('supported-docs').pipe(
			map((d) => {
				const docs = [...d]
					// Sort by name
					.sort((a, b) => {
						// Convert to uppercase for case-insensitive sorting
						const nameA = a.name.toUpperCase();
						const nameB = b.name.toUpperCase();

						if (nameA < nameB) {
							return -1;
						}
						if (nameA > nameB) {
							return 1;
						}
						return 0;
					});
				
				return docs;
			})
		)
	}

}
