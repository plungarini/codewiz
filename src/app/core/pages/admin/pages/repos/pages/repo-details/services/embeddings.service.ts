import { Injectable } from '@angular/core';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Embedding } from '../models/embedding.model';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingsService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	async getEmbeddings(repo: string) {
		const fn = this.db.callFunction<string, Embedding[]>('getEmbeddings');
		try {
			const { data } = await fn(repo);
			return data;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
