import { Timestamp } from '@angular/fire/firestore';

export type LernCourse = {
	id?: string;
	repo: string;
	owner: string;
	name: string;
	status: 'private' | 'public';
	createdAt: Timestamp;
	updatedAt: Timestamp;
}