import { firestore } from '../../utils';
import { upsertAcUser } from '../marketing';
import { getCurrentPeriodId } from '../userSubscriptions/period';

export const initUser = async (uid: string) => {
	const rolesRef = firestore.doc(`users/${uid}/protected/role`);
	const doc = await rolesRef.get();
	const data = doc.data();

	const roles = {
		...data,
		permissions: data?.permissions || [],
	};

	roles.permissions.push('user');
	await rolesRef.set(roles, { merge: true });

	await setBlankPeriodUsage(uid);
	await setGlobalStats();
	await upsertAcUser(uid);
};

const setBlankPeriodUsage = async (uid: string) => {
	const pathId = await getCurrentPeriodId(uid);
	const docRef = firestore.doc(`users/${uid}/protected/usages/bySubscription/${pathId}`);
	const doc = await docRef.get();
	const data = doc.data();
	const count = data?.count || 0;
	const createdAt = data?.createdAt?.toDate() || new Date();
	await docRef.set({
		count: count,
		createdAt,
		updatedAt: new Date(),
	}, { merge: true });
};

const setGlobalStats = async () => {
	const statsRef = firestore.doc('stats/users');
	const statsDoc = await statsRef.get();
	const statsData = statsDoc.data();

	const statsNewData = {
		...statsData,
		usersCount: (statsData?.usersCount || 0) + 1,
	};

	await statsRef.set(statsNewData, { merge: true });
};
