import { DocumentReference } from 'firebase-admin/firestore';
import { error, log, warn } from 'firebase-functions/logger';
import { StripeSubscription } from '../../models/subscription/subscription.model';
import { firestore, production } from '../../utils';
import { getCurrentPeriodId } from '../userSubscriptions/period';

export const canGenerateLernCourse = async (uid: string) => {
	if (!uid) return false;

	let canQuery = false;

	const periodPathId = await getCurrentPeriodId(uid);
	warn({ periodPathId });
	const usageDocRef = firestore.doc(`users/${uid}/protected/usages/bySubscription/${periodPathId}`);
	const usageDoc = await usageDocRef.get();
	const creditsUsed = usageDoc.data()?.lernCreditsUsed || 0;
	const count = (usageDoc.data()?.lernCount || 0) - creditsUsed;

	const creditsDocRef = firestore.doc(`users/${uid}/protected/usages`);
	const creditsDoc = await creditsDocRef.get();
	const creditsData = creditsDoc.data();
	const lernDemo = creditsData?.lernDemoUsed ? 0 : 1;
	const lernCredits = (creditsData?.lernCredits ?? 0) + lernDemo;

	log({ lernCredits });

	const docRef = firestore
		.collection(`users/${uid}/subscriptions`)
		.where('status', 'in', ['active', 'trialing']);
	const doc = await docRef.get();
	const subscription = doc.docs.at(0)?.data() as StripeSubscription | undefined;

	try {
		let productRef = subscription?.product as unknown as DocumentReference | undefined;
		const freeProductId = production() ? 'products/prod_OV9WZx4H6x0iOZ' : 'products/prod_OV9eAd1mDUMCIv';
		productRef = productRef ?? firestore.doc(freeProductId); // Fallback to free plan
		const productDoc = await productRef.get();
		const productData = productDoc.data();
		const maxCountPerProd = productData?.metadata.maxLernCountMonth as string | undefined;
		const max = isNaN(parseInt(maxCountPerProd ?? '0')) ? 0 : parseInt(maxCountPerProd ?? '0');
		const normMaxCount = (maxCountPerProd ? max : 0) + lernCredits;
		canQuery = normMaxCount <= 0 ? false : count < normMaxCount;
	} catch (err) {
		error(err);
		canQuery = false;
	}

	warn(`User ${uid} can generate Lern course: ${canQuery}`);
	return canQuery;
};

export const addUsedLernGenerationCredit = async (uid: string): Promise<void> => {
	if (!uid) return;

	const creditsDocRef = firestore.doc(`users/${uid}/protected/usages`);
	const creditsDoc = await creditsDocRef.get();
	const creditsData = creditsDoc.data();

	const periodPathId = await getCurrentPeriodId(uid);
	const docRef = firestore.doc(`users/${uid}/protected/usages/bySubscription/${periodPathId}`);
	const doc = await docRef.get();
	const data = doc.data();
	const count = data?.lernCount || 0;
	const creditsUsed = data?.lernCreditsUsed || 0;

	if (!creditsData?.lernDemoUsed) {
		await creditsDocRef.set({
			...creditsData,
			lernDemoUsed: true,
			updatedAt: new Date(),
		}, { merge: true });
	} else if ((creditsData?.lernCredits ?? 0) > 0) {
		await creditsDocRef.set({
			...creditsData,
			lernCredits: creditsData?.lernCredits - 1,
			updatedAt: new Date(),
		}, { merge: true });
	}

	const usedCredits = (creditsData?.lernCredits ?? 0) > 0 ? creditsUsed + 1 : creditsUsed;
	const used = !creditsData?.lernDemoUsed ? creditsUsed + 1 : usedCredits;

	await docRef.set({
		...data,
		lernCount: count + 1,
		lernCreditsUsed: used,
		updatedAt: new Date(),
	}, { merge: true });
};
