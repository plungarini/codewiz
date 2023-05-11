import * as functions from 'firebase-functions';
import { scrapeDocumentedPage } from './scraper';
import { elaborateEmbeddings } from './embeddings';
import { warn } from 'firebase-functions/logger';

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
  return await scrapeDocumentedPage(req);
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
  return elaborateEmbeddings(req);
});
