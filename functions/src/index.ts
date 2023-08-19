import * as functions from 'firebase-functions';
import { error, warn } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v1/auth';
import { addChatCountOnStats } from './functions/addChatCountOnStats';
import { checkUserSubscription } from './functions/checkUserSubscription';
import { disableUser as disableUserFn, isUserDisabled as isUserDisabledFn } from './functions/disableUser';
import { sendEmailActionCode } from './functions/email_action_code';
import { elaborateEmbeddings, getAllEmbeddings } from './functions/embeddings';
import { githubFolderFetcher } from './functions/githubFetcher';
import { scrapeDocumentedPage } from './functions/scraper';
import { calculateTokens } from './functions/tiktoken';
import { AiChatMessage } from './models/tiktoken/tiktoken.model';
import { firestore } from './utils';


const FFN = functions.region('europe-west2');

export const scrapePage = FFN.runWith({
  memory: '1GB',
	timeoutSeconds: 540,
	maxInstances: 10,
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
  memory: '256MB',
	timeoutSeconds: 60,
	maxInstances: 10,
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
	maxInstances: 50,
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
	maxInstances: 10,
}).https.onRequest(async (req, res) => {
  /**
	 * uid: string,
	 * repo: string,
	 * model: supportModelType,
	 * messages: AiChatMessage[],
	 * authorization: string,
   */
	warn('request', req.body);

	const key = process.env.EXTERNAL_FUNCTIONS_KEY;
	if (!key) {
		res.status(501);
	} else if (key !== req.body.authorization) {
		res.status(401);
	}

	try {
		const result = await calculateTokens({ ...req.body, type: 'prompt' });
		res.status(200).json(result);
	} catch (err) {
		error(err);
		res.status(400);
	}
});

export const calculateOpenaiTokensOnReply = FFN
	.runWith({ memory: '256MB', timeoutSeconds: 60, maxInstances: 10 }).firestore
	.document('users/{uid}/repos/{repo}/chats/{chatId}/messages/{messageId}')
	.onUpdate(async (change, context) => {
		try {
			const { uid, repo, chatId, messageId } = context.params;
			if (messageId === 'init') return;
			const message = change.after.data() as AiChatMessage;
			if (!message.role || message.role === 'user' || !!message.usage || !message.content || message.content.length <= 1) return;
			warn('New message at', `users/${uid}/repos/${repo}/chats/${chatId}/messages/${messageId}`, message);
			await calculateTokens({
				messages: [{ role: message.role, content: message.content }],
				model: 'gpt-3.5-turbo',
				repo, uid, chatId, messageId,
				type: 'completion',
			});
		} catch (err) {
			error(err);
			return err;
		}
	});

export const calculateTotalChats = FFN
	.runWith({ memory: '128MB', timeoutSeconds: 60, maxInstances: 10 })
	.firestore.document('users/{uid}/repos/{repo}/chats/{chatId}').onCreate(async (snap, ctx) => {
		const { repo } = ctx.params;
		await addChatCountOnStats(repo);
	});

export const canUserQuery = FFN
	.runWith({ memory: '256MB', timeoutSeconds: 60, maxInstances: 100 })
	.https.onRequest(async (req, res) => {
		/**
		 * uid: string,
		 * authorization: string,
		 */
		warn('request', req.body);

		const key = process.env.EXTERNAL_FUNCTIONS_KEY;
		if (!key) {
			res.status(501);
		} else if (key !== req.body.authorization) {
			res.status(401);
		}

		try {
			const result = await checkUserSubscription(req.body.uid);
			res.status(200).json(result);
		} catch (err) {
			error(err);
			res.status(400);
		}
	});

export const setDefaultPermissions = FFN
	.runWith({ memory: '128MB', timeoutSeconds: 60, maxInstances: 10 })
	.firestore.document('users/{uid}').onCreate(async (snap) => {
		const rolesRef = snap.ref.collection('protected').doc('role');
		const doc = await rolesRef.get();
		const data = doc.data();

		const statsRef = firestore.doc('stats/users');
		const statsDoc = await statsRef.get();
		const statsData = statsDoc.data();

		const statsNewData = {
			...statsData,
			usersCount: (statsData?.usersCount || 0) + 1,
		};

		await statsRef.set(statsNewData, { merge: true });

		const newData = {
			...data,
			permissions: data?.permissions || [],
		};

		newData.permissions.push('user');
		await rolesRef.set(newData, { merge: true });
	});

export const disableUser = FFN
	.runWith({ memory: '128MB', timeoutSeconds: 60, maxInstances: 10 })
	.https.onCall(async (data, context) => {
		const { uid } = data;
		if (!uid ) throw new HttpsError('invalid-argument', 'UID is required');
		const contextUid = context.auth?.uid;
		if (!contextUid) throw new HttpsError('invalid-argument', 'Context UID is required');

		try {
			await disableUserFn(uid, contextUid);
		} catch (err) {
			error(err);
			throw err;
		}
	});

export const isUserDisabled = FFN
	.runWith({ memory: '128MB', timeoutSeconds: 60, maxInstances: 10 })
	.https.onCall(async (data) => {
		const { uid } = data;
		if (!uid) throw new HttpsError('invalid-argument', 'UID is required');

		try {
			return await isUserDisabledFn(uid);
		} catch (err) {
			error(err);
			throw err;
		}
	});


export const emailActionCode = FFN.runWith({ memory: '128MB', timeoutSeconds: 60, maxInstances: 10 }).https.onCall(async (data) => {
	return await sendEmailActionCode(data);
});

export const getEmbeddings = FFN.runWith({ memory: '128MB', timeoutSeconds: 60, maxInstances: 10 }).https.onCall(async (data) => {
	return await getAllEmbeddings(data);
});
