import { Timestamp } from '@angular/fire/firestore';

export type SelectedDocs = {
	id: string;
	name: string;
	logo: string;
	url: string;
	hide: boolean;
	hostUrl: string;
	replaceUrl?: string;
	replaceStrings: { s: string, r: string }[];
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
}