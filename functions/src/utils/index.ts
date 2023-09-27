import * as admin from 'firebase-admin';
import { warn } from 'firebase-functions/logger';

admin.initializeApp();


export const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true });

export const auth = admin.auth();

export const production = () => {
	const prod = !process.env.GCLOUD_PROJECT?.includes('-staging');
	if (!prod) warn('[DEV ENVIRONMENT] Prevented to execute function.');
	return prod;
};
