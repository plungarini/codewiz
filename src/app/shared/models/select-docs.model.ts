import { Timestamp } from '@angular/fire/firestore';

export type SelectedDocs = {
	id: string;
	name: string;
	logo: string;
	lastUpdate: Timestamp;
	url: string;
}