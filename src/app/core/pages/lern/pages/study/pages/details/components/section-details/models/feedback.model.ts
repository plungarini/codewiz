
export type LernFeedback = {
	courseId: string;
	uid: string;
	reaction?: 'bad' | 'good' | 'great';
	comment?: string;
}