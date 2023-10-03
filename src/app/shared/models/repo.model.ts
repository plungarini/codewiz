import { Timestamp } from '@angular/fire/firestore';

export type RepoPage = {
	name: string;
	title: string;
	content: string;
	path: string;
	status?: 'loading' | 'success' | 'failed';
}

export type Repo = {
	id: string;
	name: string;
	logo: string;
	url: string;
	hide: boolean;
	hostUrl: string;
	replaceUrl: string;
	tableName: string;
	querySuggestions?: string[];
	replaceStrings: {
		s: string;
		r: string;
	}[];
	editPagesSearch?: {
		author: string[];
		folder: string[];
		relativeLinksHost: string[];
	};
	embeddingsUpdatedAt?: Timestamp;
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
}
