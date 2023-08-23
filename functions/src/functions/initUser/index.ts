import { firestore } from '../../utils';

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

	await setGlobalStats();
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
