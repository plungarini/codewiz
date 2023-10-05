import { firestore } from '../../utils';
import { getCurrentPeriodId } from './period';

export const setSubscriptionPeriodUsage = async (uid: string) => {
	const pathId = await getCurrentPeriodId(uid);
	const docRef = firestore.doc(`users/${uid}/protected/usages/bySubscription/${pathId}`);
	const doc = await docRef.get();
	const data = doc.data();
	const count = data?.count || 0;
	const chatCreditsUsed = data?.chatCreditsUsed || 0;
	const createdAt = data?.createdAt?.toDate() || new Date();

	const creditsDocRef = firestore.doc(`users/${uid}/protected/usages`);
	const creditsDoc = await creditsDocRef.get();
	const creditsData = creditsDoc.data();
	const chatCredits = (creditsData?.chatCredits ?? 0);

	if (chatCredits > 0) {
		await creditsDocRef.set({
			...creditsData,
			chatCredits: chatCredits - 1,
			updatedAt: new Date(),
		});
	}

	await docRef.set({
		...data,
		count: count + 1,
		chatCreditsUsed: chatCredits > 0 ? chatCreditsUsed + 1 : chatCreditsUsed,
		createdAt,
		updatedAt: new Date(),
	}, { merge: true });
};
