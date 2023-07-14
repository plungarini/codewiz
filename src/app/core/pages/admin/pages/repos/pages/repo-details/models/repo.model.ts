export type RepoPage = {
	name: string;
	title: string;
	content: string;
	path: string;
	status?: 'loading' | 'success' | 'failed';
}