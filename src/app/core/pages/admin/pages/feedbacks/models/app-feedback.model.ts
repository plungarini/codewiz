import { Timestamp } from 'src/app/auth/models/timestamp.model';
import { User } from 'src/app/auth/models/user.model';

export type AppFeedback = {
	id: string;
	content: string;
	uid: string;
	user?: User;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}