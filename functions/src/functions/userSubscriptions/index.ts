import { firestore } from '../../utils';
import { getCurrentPeriodId } from './period';

export const setSubscriptionPeriodUsage = async (uid: string) => {
	const pathId = await getCurrentPeriodId(uid);
	const docRef = firestore.doc(`users/${uid}/protected/usages/bySubscription/${pathId}`);
	const doc = await docRef.get();
	const data = doc.data();
	const count = data?.count || 0;
	const createdAt = data?.createdAt?.toDate() || new Date();
	await docRef.set({
		count: count + 1,
		createdAt,
		updatedAt: new Date(),
	}, { merge: true });
};
