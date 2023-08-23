import { DocumentReference } from 'firebase-admin/firestore';
import { error, warn } from 'firebase-functions/logger';
import { CompletionStat } from '../../models/chat-stats/chat-stats.model';
import { StripeSubscription } from '../../models/subscription/subscription.model';
import { firestore } from '../../utils';

let totalRepos: string[] = [];

export const checkUserSubscription = async (uid: string) => {
	if (!uid) return false;
	let canQuery = false;

	const docRef = firestore
		.collection(`users/${uid}/subscriptions`)
		.where('status', 'in', ['active', 'trialing']);
	const doc = await docRef.get();
	const subscription = doc.docs.at(0)?.data() as StripeSubscription | undefined;

	totalRepos = totalRepos.length > 0 ? totalRepos : (await firestore.collection('supported-docs').get()).docs.map((doc) => doc.id);
	const thisMonth = new Date().getMonth();
	const thisYear = new Date().getFullYear();
	const dateId = `${thisMonth < 10 ? '0' : ''}${thisMonth}_${thisYear}`;

	const reposUsage: CompletionStat[] = [];
	for (const repo of totalRepos) {
		const repoDocRef = firestore.doc(`users/${uid}/protected/usages/${repo}/${dateId}`);
		const repoDoc = await repoDocRef.get();
		if (!repoDoc.exists) continue;

		const usage = (repoDoc.data() || {}) as CompletionStat;
		reposUsage.push(usage);
	}

	const totalCount = reposUsage.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b.prompt.count) ? 0 : b.prompt.count), 0);
	warn(`User ${uid} has ${totalCount} completions in repos`);

	try {
		let productRef = subscription?.product as unknown as DocumentReference | undefined;
		productRef = productRef ? productRef : firestore.doc('products/prod_OV9WZx4H6x0iOZ'); // Fallback to free plan
		const productDoc = await productRef.get();
		const productData = productDoc.data();
		const maxCountPerProd = productData?.metadata.maxPromptCountMonth as string | undefined;
		const normMaxCount = maxCountPerProd ? isNaN(parseInt(maxCountPerProd)) ? 0 : parseInt(maxCountPerProd) : 0;
		canQuery = totalCount <= normMaxCount;
	} catch (err) {
		error(err);
		canQuery = false;
	}

	warn(`User ${uid} can query: ${canQuery}`);
	return canQuery;
};
