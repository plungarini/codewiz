import * as admin from 'firebase-admin';
import { warn } from 'firebase-functions/logger';

admin.initializeApp();

export const firestore = admin.firestore();
export const auth = admin.auth();
export const production = () => {
	const prod = process.env.GCLOUD_PROJECT?.includes('-staging') ? false : true;
	if (!prod) warn('[DEV ENVIRONMENT] Prevented to execute function.');
	return prod;
};
