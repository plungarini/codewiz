import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Embedding, FetchGitRepoData, FetchGitRepoRes, GenerateEmbeddingData } from '../models/embedding.model';
import { AdminRepoService } from './admin-repo.service';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingsService {

	constructor(
		private db: FirebaseExtendedService,
		private adminRepo: AdminRepoService,
		private functions: Functions
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
    const scrapePage = httpsCallable<GenerateEmbeddingData, boolean>(
      this.functions,
      'createEmbedding',
      { timeout: 540 * 1000 }
    );
		const { data: res } = await scrapePage(data);
		const generated = !!res && typeof res === 'boolean';
		if (!generated) throw new Error(`Skipping generation for file: ${data.id}`);
		console.log(`Generated embedding?`, generated);
  }

	async fetchGitRepo(data: FetchGitRepoData): Promise<FetchGitRepoRes[]> {
		const githubFetcher = httpsCallable<FetchGitRepoData, FetchGitRepoRes[]>(
      this.functions,
      'githubFetcher',
      { timeout: 540 * 1000 }
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
