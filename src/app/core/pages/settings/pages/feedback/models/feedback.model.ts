import { Timestamp } from 'src/app/auth/models/timestamp.model';

export type UserFeedback = {
	id: string;
	uid: string;
	content: string;
	updatedAt: Timestamp;
	createdAt: Timestamp;
}