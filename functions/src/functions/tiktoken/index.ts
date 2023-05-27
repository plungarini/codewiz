import { warn } from 'firebase-functions/logger';
import { GPTTokens, supportModelType } from 'gpt-tokens';
import { AiChatMessage } from '../../models/tiktoken/tiktoken.model';

export const calculateTokens = (data: {
	uid: string,
	model: supportModelType,
	messages: AiChatMessage[],
}) => {
	const { messages, model/* , uid */ } = data;
	const { usedTokens, usedUSD } = new GPTTokens({ messages, model });
	warn({ usedTokens, usedUSD });
	return { usedTokens, usedUSD };
};
