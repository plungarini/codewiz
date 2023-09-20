import { Timestamp } from 'src/app/auth/models/timestamp.model';

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
	chatCount?: number;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export interface RepoStat extends Partial<CompletionStat> {
	history: CompletionStat[];
}