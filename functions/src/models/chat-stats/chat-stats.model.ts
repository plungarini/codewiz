import { Timestamp } from 'firebase-admin/firestore';

export type CompletionStat = {
	id: string;
	completion: {
		averageTokenPerCompletion: number;
		averageUSDPerCompletion: number;
		count: number;
		totalTokens: number;
		totalUSD: number;
	};
	prompt: {
		averageTokenPerPrompt: number;
		averageUSDPerPrompt: number;
		count: number;
		totalTokens: number;
		totalUSD: number;
	};
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
