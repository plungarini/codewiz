import { warn } from 'firebase-functions/logger';
import { StripeSubscription } from '../../../models/subscription/subscription.model';
import { firestore } from '../../../utils';

export const getCurrentPeriodId = async (uid: string) => {
	const subsDocRef = firestore
		.collection(`users/${uid}/subscriptions`)
		.where('status', 'in', ['active', 'trialing'])
		.limit(1);
	const subsDoc = await subsDocRef.get();

	// If no subscription is found
	if (subsDoc.empty) {
		// Get user creation date and return "FREE" period ID
		warn('No subscription found');
		return await handleFallbackPeriodId(uid);
	}

	const sub = subsDoc.docs.map((d) => ({ id: d.id, ...d.data() }))?.at(0) as StripeSubscription | undefined;
	if (!sub) return await handleFallbackPeriodId(uid);

	const startDate = sub?.current_period_start?.toDate();
	const endDate = sub?.current_period_end?.toDate();
	if (!startDate || !endDate) return await handleFallbackPeriodId(uid);

	const interval = (await sub.price.get())?.data()?.interval as string || undefined;
	if (!interval) return await handleFallbackPeriodId(uid);

	if (interval === 'month') {
		warn('Monthly period');
		return `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
	} else if (interval === 'year') {
		warn('Yearly period');
		return getYearlyId(startDate, new Date());
	} else {
		return await handleFallbackPeriodId(uid);
	}
};

const handleFallbackPeriodId = async (uid: string) => {
	warn('Free period fallback');
	// Get user creation date and return "FREE" period ID
	const userRef = firestore.collection('users').doc(uid);
	const userDoc = await userRef.get();
	const userCreatedDate: Date = userDoc.data()?.createdAt?.toDate();
	if (!userCreatedDate) throw new Error(`User ${uid} not found`);
	return getFreePeriodId(userCreatedDate, new Date());
};

const getYearlyId = (startDate: Date, currentDate: Date): string => {
	// Get the difference in milliseconds and convert to days
	const daysDiff = Math.round(Math.abs(+startDate - +currentDate) / (1000 * 60 * 60 * 24));

	let startPeriod: Date;

	if (daysDiff > 30) {
		// More than 30 days have passed, so use the current year and month with the day of startDate
		startPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth(), startDate.getDate());
	} else {
		startPeriod = startDate;
	}

	const endPeriod = new Date(startPeriod);
	endPeriod.setMonth(endPeriod.getMonth() + 1);

	return `${startPeriod.toISOString().split('T')[0]}_${endPeriod.toISOString().split('T')[0]}`;
};

const getFreePeriodId = (startDate: Date, currentDate: Date): string => {
	const id = getYearlyId(startDate, currentDate);
	return `FREE_${id}`;
};
