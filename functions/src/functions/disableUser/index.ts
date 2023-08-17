/*
	const { uid, disabled } = data;
		if (!uid || typeof disabled !== 'boolean') return;

		const contextUid = context.auth?.uid;
		if (!contextUid) return;

		const adminRef = firestore.doc(`users/${contextUid}/protected/role`);
		const doc = await adminRef.get();
		const isAdmin = (doc.data()?.permissions || []).includes('admin');

		if (!isAdmin) return;

		await auth.updateUser(uid, { disabled });
*/

import { auth, firestore } from '../../utils';

export const disableUser = async (uid: string, contextUid: string) => {
	if (!uid || !contextUid) return;

	const adminRef = firestore.doc(`users/${contextUid}/protected/role`);
	const doc = await adminRef.get();
	const isAdmin = (doc.data()?.permissions || []).includes('admin');

	if (!isAdmin) return;

	const isDisabled = await isUserDisabled(uid);
	await auth.updateUser(uid, { disabled: !isDisabled });
};

export const isUserDisabled = async (uid: string) => {
	try {
		const fireUser = await auth.getUser(uid);
		return fireUser.disabled;
	} catch (err) {
		return false;
	}
};
