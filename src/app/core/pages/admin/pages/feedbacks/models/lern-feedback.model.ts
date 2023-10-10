import { Timestamp } from 'src/app/auth/models/timestamp.model';
import { User } from 'src/app/auth/models/user.model';
import { LernCourseRequest } from 'src/app/core/pages/lern/models/course.model';

export type LernFeedback = {
	id: string;
	comment?: string;
	courseId: string;
	reaction?: 'bad' | 'good' | 'great';
	uid: string;
	user?: User;
	course?: LernCourseRequest;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}