import * as admin from 'firebase-admin';

admin.initializeApp();


export const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true });

export const auth = admin.auth();

export const production = () => {
	return !process.env.GCLOUD_PROJECT?.includes('-staging');
};
