import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

type fetchPageData = {
  page_link: string;
  body_selector: string;
  excluded_selectors: string[];
};

type generateEmbeddingData = {
  title: string;
  link: string;
  content: string;
  id: string;
};

@Injectable({
  providedIn: 'root',
})
export class HtmlToMdService {
  constructor(private functions: Functions) {}

  async fetchPage(
    data: fetchPageData
  ): Promise<{ markdown: string; page_title: string }> {
    const scrapePage = httpsCallable<
      fetchPageData,
      { markdown: string; page_title: string }
    >(this.functions, 'scrapePage', { timeout: 540 * 1000 });
    const { data: res } = await scrapePage(data);
    return res;
  }

  async generateEmbedding(data: generateEmbeddingData): Promise<void> {
    const scrapePage = httpsCallable<generateEmbeddingData, boolean>(
      this.functions,
      'createEmbedding',
      { timeout: 540 * 1000 }
    );
    const { data: res } = await scrapePage(data);
    console.log(`Generated embedding?`, res);
  }
}
