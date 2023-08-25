import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Repo } from 'src/app/shared/models/repo.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class UserRepoService {

	constructor(
		private db: FirebaseExtendedService,
	) { }
	
	getAllSupportedDocs() {
		return this.db.getCol<Repo>('supported-docs').pipe(
			map(d => d.sort((a, b) => {
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
			}))
		);
	}

	getRepo(id: string) {
		return this.db.getDoc<Repo>(`supported-docs/${id}`);
	}

}
