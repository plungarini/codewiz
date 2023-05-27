import * as functions from 'firebase-functions';
import { error, warn } from 'firebase-functions/logger';
import { elaborateEmbeddings } from './functions/embeddings';
import { githubFolderFetcher } from './functions/githubFetcher';
import { scrapeDocumentedPage } from './functions/scraper';
import { calculateTokens } from './functions/tiktoken';

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
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onCall(async (req) => {
  /**
	 * author: string;
	 * folder: string;
   */
  warn('request', req);
	try {
		return await githubFolderFetcher(req);
	} catch (err) {
		error(err);
		return err;
	}
});

export const calculateOpenaiTokens = FFN.runWith({
  memory: '256MB',
  timeoutSeconds: 60,
}).https.onRequest(async (req, res) => {
  /**
	 * uid: string,
	 * model: supportModelType,
	 * messages: AiChatMessage[],
   */
  warn('request', req);
	try {
		const result = calculateTokens(req.body);
		res.send(200).json(result);
	} catch (err) {
		error(err);
		res.send(400);
	}
});
