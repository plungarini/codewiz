import { error, warn } from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v1/auth';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentCreated, onDocumentUpdated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { addChatCountOnStats } from './functions/addChatCountOnStats';
import { checkUserSubscription } from './functions/checkUserSubscription';
import { disableUser as disableUserFn, isUserDisabled as isUserDisabledFn } from './functions/disableUser';
import { sendEmailActionCode } from './functions/email_action_code';
import { elaborateEmbeddings, getAllEmbeddings } from './functions/embeddings';
import { githubFolderFetcher } from './functions/githubFetcher';
import { checkUserData, initUser as initUserFn } from './functions/initUser';
import { setGlobalLernStatus } from './functions/lern/common/utils';
import { createLernCoursePlan } from './functions/lern/course-plan';
import { createLernCourseSection } from './functions/lern/course-sections';
import { canGenerateLernCourse } from './functions/lern/lern-usage';
import { upsertAcUser } from './functions/marketing';
import { scrapeDocumentedPage } from './functions/scraper';
import { calculateTokens } from './functions/tiktoken';
import { AiChatMessage } from './models/tiktoken/tiktoken.model';

setGlobalOptions({
	concurrency: 100,
	maxInstances: 10,
	memory: '256MiB',
	region: 'europe-west1',
	timeoutSeconds: 120,
	preserveExternalChanges: true,
});

export const scrapePage = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
	memory: '1GiB',
	timeoutSeconds: 540,
	maxInstances: 10,
}, async (req) => {
	/**
   * page_link: string;
   * body_selector: string;
   * excluded_selectors: string[];
   */
	const data = req.data;
	try {
		return await scrapeDocumentedPage(data);
	} catch (err) {
		error(err);
		return err;
	}
});

export const createEmbedding = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
	memory: '256MiB',
}, async (req) => {
	/**
	 * author: string;
	 * title: string;
	 * table: string;
	 * link: string;
	 * content: string;
	 * id: string;
	 */
	const data = req.data;
	warn('request', data);
	try {
		return await elaborateEmbeddings(data);
	} catch (err) {
		error(err);
		return err;
	}
});

export const githubFetcher = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
	memory: '256MiB',
	maxInstances: 50,
}, async (req) => {
	/**
	 * author: string;
	 * folder: string;
	 */
	const data = req.data;
	warn('request', data);
	try {
		return await githubFolderFetcher(data);
	} catch (err) {
		error(err);
		return err;
	}
});

export const calculateOpenaiTokens = onRequest({
	cors: true,
	timeoutSeconds: 540,
	memory: '256MiB',
}, async (req, res) => {
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

export const calculateOpenaiTokensOnReply = onDocumentUpdated(
	'users/{uid}/repos/{repo}/chats/{chatId}/messages/{messageId}',
	async (event) => {
		try {
			const { uid, repo, chatId, messageId } = event.params;
			if (messageId === 'init') return;
			const message = event.data?.after.data() as AiChatMessage | undefined;
			if (!message?.role || message.role === 'user' || !!message.usage || !message.content || message.content.length <= 1) return;
			warn('New message at', `users/${uid}/repos/${repo}/chats/${chatId}/messages/${messageId}`, message);
			await calculateTokens({
				messages: [{ role: message.role, content: message.content }],
				model: 'gpt-3.5-turbo-0613',
				repo, uid, chatId, messageId,
				type: 'completion',
			});
		} catch (err) {
			error(err);
		}
	}
);

export const calculateTotalChats = onDocumentCreated(
	'users/{uid}/repos/{repo}/chats/{chatId}',
	async (event) => {
		const { repo } = event.params;
		try {
			await addChatCountOnStats(repo);
		} catch (err) {
			error(err);
		}
	}
);

export const onLernCourse = onDocumentWritten({
	document: 'lern/{uid}/courses/{id}',
	timeoutSeconds: 540,
	maxInstances: 10,
	memory: '4GiB',
}, async (event) => {
	const MAX_RETRIES = 3;

	const { uid, id } = event.params;
	if (!uid || !id) return;
	const course = event.data?.after.data() as any;
	const isDeleted = event.data?.before.exists && !event.data?.after.exists;
	const planCreated = course.planCreated;
	const isMaxRetries = (course?.tries ?? 0) >= MAX_RETRIES;
	if (isDeleted || planCreated || isMaxRetries) {
		if (isMaxRetries) {
			await setGlobalLernStatus({ uid, course: id }, { hasError: true });
		}
		return;
	}
	try {
		await createLernCoursePlan(uid, id, course);
		return;
	} catch (err) {
		error(err);
		return;
	}
});

export const onLernCourseSection = onDocumentWritten({
	document: 'lern/{uid}/courses/{courseId}/sections/{sectionId}',
}, async (event) => {
	const MAX_RETRIES = 3;

	const { uid, courseId, sectionId } = event.params;
	if (!uid || !courseId || !sectionId) return;
	const section = event.data?.after.data() as any;
	const isDeleted = event.data?.before.exists && !event.data?.after.exists;
	const isMaxRetries = (section?.tries ?? 0) >= MAX_RETRIES;
	const sectionCreated = section?.sectionCompleted;
	if (isDeleted || isMaxRetries || sectionCreated) {
		if (isMaxRetries) {
			await setGlobalLernStatus({ uid, course: courseId }, { hasError: true });
		}
		return;
	}
	try {
		await createLernCourseSection(uid, courseId, sectionId, section);
		return;
	} catch (err) {
		error(err);
		return;
	}
});

export const canUserQuery = onRequest({
	cors: true,
	memory: '256MiB',
	maxInstances: 100,
	timeoutSeconds: 540,
}, async (req, res) => {
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

export const canUserLern = onRequest({
	cors: true,
	memory: '256MiB',
	maxInstances: 100,
	timeoutSeconds: 540,
}, async (req, res) => {
	warn('request', req.body);

	const key = process.env.EXTERNAL_FUNCTIONS_KEY;
	if (!key) {
		res.status(501);
	} else if (key !== req.body.authorization) {
		res.status(401);
	}

	try {
		const result = await canGenerateLernCourse(req.body.uid);
		res.status(200).json(result);
	} catch (err) {
		error(err);
		res.status(400);
	}
});

export const onUserUsageUpdate = onDocumentWritten(
	'users/{uid}/protected/usages/bySubscription/{periodId}',
	async (event) => {
		const uid = event.params.uid;
		if (!uid) {
			error('User id is undefined');
			return;
		}

		try {
			await checkUserData(uid);
			await upsertAcUser(uid);
		} catch (err) {
			error(err);
			return;
		}
	}
);

export const onUserOnboardingUpdate = onDocumentWritten(
	'users/{uid}/onboarding/data',
	async (event) => {
		const uid = event.params.uid;
		if (!uid) {
			error('User id is undefined');
			return;
		}

		try {
			await checkUserData(uid);
			await upsertAcUser(uid);
		} catch (err) {
			error(err);
			return;
		}
	}
);

export const onUserSubscriptionsUpdate = onDocumentWritten(
	'users/{uid}/subscriptions/{subId}',
	async (event) => {
		const uid = event.params.uid;
		if (!uid) {
			error('User id is undefined');
			return;
		}

		try {
			await checkUserData(uid);
			await upsertAcUser(uid);
		} catch (err) {
			error(err);
			return;
		}
	}
);

export const onUserUpdate = onDocumentUpdated(
	'users/{uid}',
	async (event) => {
		const doc = event.data?.after;
		const uid = doc?.id;
		const user = doc?.data();
		if (!uid) {
			error('User id is undefined');
			return;
		}

		try {
			await checkUserData(uid);
			await upsertAcUser(uid, user);
		} catch (err) {
			error(err);
			return;
		}
	}
);

export const initUser = onDocumentCreated(
	'users/{uid}',
	async (event) => {
		try {
			const { uid } = event.params;
			if (!uid) {
				error('User id is undefined');
				return;
			}
			await initUserFn(uid);
		} catch (err) {
			error(err);
		}
	}
);

export const disableUser = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
	memory: '128MiB',
}, async (req) => {
	const { uid } = req.data;
	try {
		if (!uid ) throw new HttpsError('invalid-argument', 'UID is required');
		const contextUid = req.auth?.uid;
		if (!contextUid) throw new HttpsError('invalid-argument', 'Context UID is required');

		await disableUserFn(uid, contextUid);
	} catch (err) {
		error(err);
		throw err;
	}
});

export const isUserDisabled = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
}, async (req) => {
	const { uid } = req.data;
	try {
		if (!uid) throw new HttpsError('invalid-argument', 'UID is required');
		return await isUserDisabledFn(uid);
	} catch (err) {
		error(err);
		throw err;
	}
});

export const emailActionCode = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
}, async (req) => {
	return await sendEmailActionCode(req.data);
});

export const getEmbeddings = onCall({
	/* cors: [
		/^https?:\/\/codewiz\.app$/,
		/^https?:\/\/.*\.codewiz\.app$/,
	], */
}, async (req) => {
	return await getAllEmbeddings(req.data);
});
