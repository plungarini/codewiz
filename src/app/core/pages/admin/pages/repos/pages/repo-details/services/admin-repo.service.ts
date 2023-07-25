import { Injectable } from '@angular/core';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Repo } from '../../../../../../../../shared/models/repo.model';

@Injectable({
  providedIn: 'root'
})
export class AdminRepoService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	async updateRepo(data: Partial<Repo>): Promise<void> {
		if (!data.id) throw new Error('Repo id is required');
		await this.db.upsert(`supported-docs/${data.id}`, data);
	}
}
