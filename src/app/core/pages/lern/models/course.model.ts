import { Timestamp } from '@angular/fire/firestore';

type LernStepTopic = {
	query: string;
	pages: SearchDocsResponse['pages'];
	res: { can: boolean, suggested?: string }
}

type LernStepPreferences = {
	contentDepth: 'beginner' | 'intermediate' | 'advanced';
	duration: 'short' | 'medium' | 'long';
	goal: 'knowledge' | 'skill' | 'certification';
	style: 'theory' | 'practical';
	assessment: 'quizz' | 'assignments' | 'none';
	language: string;
	revision: boolean;
}

type LernGenerationStatus = {
	completed: boolean;
	started: boolean;
	planCompleted: boolean;
	totalSections: number;
	completedSections: number;
	hasError: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export type LernCourse = {
	id?: string;
	repo: string;
	owner: string;
	name: string;
	generation?: LernGenerationStatus;
	topic?: LernStepTopic;
	preferences?: LernStepPreferences;
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