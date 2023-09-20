import { DocumentReference } from 'firebase-admin/firestore';
import { error, warn } from 'firebase-functions/logger';
import { StripeSubscription } from '../../models/subscription/subscription.model';
import { firestore } from '../../utils';
import { getCurrentPeriodId } from '../userSubscriptions/period';


export const checkUserSubscription = async (uid: string) => {
	if (!uid) return false;
	let canQuery = false;

	const periodPathId = await getCurrentPeriodId(uid);
	const docRef2 = firestore.doc(`users/${uid}/protected/usages/bySubscription/${periodPathId}`);
	const doc2 = await docRef2.get();
	const count = doc2.data()?.prompt || 0;

	const docRef = firestore
		.collection(`users/${uid}/subscriptions`)
		.where('status', 'in', ['active', 'trialing']);
	const doc = await docRef.get();
	const subscription = doc.docs.at(0)?.data() as StripeSubscription | undefined;

	try {
		let productRef = subscription?.product as unknown as DocumentReference | undefined;
		productRef = productRef ? productRef : firestore.doc('products/prod_OV9WZx4H6x0iOZ'); // Fallback to free plan
		const productDoc = await productRef.get();
		const productData = productDoc.data();
		const maxCountPerProd = productData?.metadata.maxPromptCountMonth as string | undefined;
		const normMaxCount = maxCountPerProd ? isNaN(parseInt(maxCountPerProd)) ? 0 : parseInt(maxCountPerProd) : 0;
		canQuery = count <= normMaxCount;
	} catch (err) {
		error(err);
		canQuery = false;
	}

	warn(`User ${uid} can query: ${canQuery}`);
	return canQuery;
};
