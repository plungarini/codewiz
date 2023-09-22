import { Timestamp } from '@angular/fire/firestore';

type LernStepTopic = {
	query: string;
	pages: SearchDocsResponse['pages'];
	res: { can: boolean, suggested?: string }
}

export type LernCourse = {
	id?: string;
	repo: string;
	owner: string;
	name: string;
	steps?: {
		topic?: LernStepTopic;
	};
	status: 'private' | 'public';
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export type SearchDocsResponse = {
	can: boolean;
	pages: {
		id: string;
		title: string;
		content: string;
	}[];
	suggested?: string;
};