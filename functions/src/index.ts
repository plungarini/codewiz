import * as functions from 'firebase-functions';
import { error, warn } from 'firebase-functions/logger';
import { elaborateEmbeddings } from './embeddings';
import { githubFolderFetcher } from './githubFetcher';
import { scrapeDocumentedPage } from './scraper';

const FFN = functions.region('europe-west2');

export const scrapePage = FFN.runWith({
  memory: '1GB',
  timeoutSeconds: 540,
}).https.onCall(async (req) => {
  /**
   * page_link: string;
   * body_selector: string;
   * excluded_selectors: string[];
   */
	try {
		return await scrapeDocumentedPage(req);
	} catch (err) {
		error(err);
		return err;
	}
});

export const createEmbedding = FFN.runWith({
  memory: '128MB',
  timeoutSeconds: 60,
}).https.onCall(async (req) => {
  /**
   * title: string;
   * link: string;
   * content: string;
   * id: string;
   */
  warn('request', req);
	try {
		return await elaborateEmbeddings(req);
	} catch (err) {
		error(err);
		return err;
	}
});

export const githubFetcher = FFN.runWith({
  memory: '128MB',
  timeoutSeconds: 60,
}).https.onCall(async (req) => {
  /**
   * title: string;
   */
  warn('request', req);
	try {
		return await githubFolderFetcher();
	} catch (err) {
		error(err);
		return err;
	}
});
