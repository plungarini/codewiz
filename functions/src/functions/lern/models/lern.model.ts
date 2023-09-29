import { Timestamp } from 'firebase-admin/firestore';

export type LernStepTopic = {
	query: string;
	pages: {
		id: string;
		title: string;
		content: string;
	}[];
	res: { can: boolean, suggested?: string }
}

export type LernStepPreferences = {
	contentDepth: 'beginner' | 'intermediate' | 'advanced';
	duration: 'short' | 'medium' | 'long';
	goal: 'knowledge' | 'skill' | 'certification';
	style: 'theory' | 'practical';
	assessment: 'quizz' | 'assignments' | 'none';
	language: string;
	revision: boolean;
}

export type LernCoursePlanGenerationSection = {
	id: string;
	title: string;
	order: number;
	goals: string[];
	shortDescription: string;
	content?: LernCourseGenerationSection;
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
}

export type LernCourseGenerationSection = {
	sectionTitle: string;
	content: string;
	tldr: string;
	quiz?: {
		question: string;
		quizType: 'single' | 'multi';
		options: {
			option: string;
			isCorrect: boolean;
			why?: string;
		}[];
	};
	assignment?: string;
}

export type LernCoursePlanGeneration = {
	courseName: string;
	shortDescription: string;
	sections: LernCoursePlanGenerationSection[];
	prerequisites?: string[];
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
}

export type LernUsage = {
	prompt: {
		tokens: number;
		usd: number;
	};
	completion: {
		tokens: number;
		usd: number;
	};
	total: {
		tokens: number;
		usd: number;
	};
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export type LernGenerationStatus = {
	completed: boolean;
	started: boolean;
	error: 'incomplete' | 'server_error';
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
