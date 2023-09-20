import { Injectable } from '@angular/core';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Embedding, FetchGitRepoData, FetchGitRepoRes, GenerateEmbeddingData } from '../models/embedding.model';

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

  /* async fetchPage(
    data: FetchPageData
  ): Promise<{ markdown: string; page_title: string }> {
    const scrapePage = httpsCallable<
      FetchPageData,
      { markdown: string; page_title: string }
    >(this.functions, 'scrapePage', { timeout: 540 * 1000 });
    const { data: res } = await scrapePage(data);
    return res;
  } */

  async generateEmbedding(data: GenerateEmbeddingData): Promise<void> {
    const scrapePage = this.db.callFunction<GenerateEmbeddingData, boolean>(
			'createEmbedding',
			'europe-west1',
			2,
      540 * 1000
    );
		const { data: res } = await scrapePage(data);
		const generated = !!res && typeof res === 'boolean';
		if (!generated) throw new Error(`Skipping generation for file: ${data.id}`);
		console.log(`Generated embedding?`, generated);
  }

	async fetchGitRepo(data: FetchGitRepoData): Promise<FetchGitRepoRes[]> {
		const githubFetcher = this.db.callFunction<FetchGitRepoData, FetchGitRepoRes[]>(
			'githubFetcher',
			'europe-west1',
			2,
      540 * 1000
		);
		try {
			const { data: res } = await githubFetcher(data);
			console.log(res);

			if (typeof res === 'object') {
				if (Array.isArray(res)) {
					return res;
				} else {
					return [];
				}
			} else {
				return []
			}
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}
