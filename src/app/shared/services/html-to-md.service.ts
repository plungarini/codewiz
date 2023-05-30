import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

type FetchPageData = {
  page_link: string;
  body_selector: string;
  excluded_selectors: string[];
};

type GenerateEmbeddingData = {
	author: string
  title: string;
  link: string;
  content: string;
  id: string;
};

type FetchGitRepoData = {
	author: string;
	folder: string;
	relativeLinksHost: string;
}

type FetchGitRepoRes = {
	name: string;
	content: string;
	title: string;
	path: string;
}

@Injectable({
  providedIn: 'root',
})
export class HtmlToMdService {
  constructor(private functions: Functions) {}

  async fetchPage(
    data: FetchPageData
  ): Promise<{ markdown: string; page_title: string }> {
    const scrapePage = httpsCallable<
      FetchPageData,
      { markdown: string; page_title: string }
    >(this.functions, 'scrapePage', { timeout: 540 * 1000 });
    const { data: res } = await scrapePage(data);
    return res;
  }

  async generateEmbedding(data: GenerateEmbeddingData): Promise<void> {
    const scrapePage = httpsCallable<GenerateEmbeddingData, boolean>(
      this.functions,
      'createEmbedding',
      { timeout: 540 * 1000 }
    );
		const { data: res } = await scrapePage(data);
		if (typeof res !== 'boolean') throw new Error(`Skipping generation for file: ${data.id}`)
    console.log(`Generated embedding?`, res && typeof res === 'boolean');
  }

	async fetchGitRepo(data: FetchGitRepoData): Promise<FetchGitRepoRes[]> {
		const scrapePage = httpsCallable<FetchGitRepoData, FetchGitRepoRes[]>(
      this.functions,
      'githubFetcher',
      { timeout: 540 * 1000 }
		);
		try {
			const { data: res } = await scrapePage(data);
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
