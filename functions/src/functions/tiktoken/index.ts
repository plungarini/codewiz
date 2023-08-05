import { warn } from 'firebase-functions/logger';
import { GPTTokens, supportModelType } from 'gpt-tokens';
import { AiChatMessage } from '../../models/tiktoken/tiktoken.model';
import { firestore } from '../../utils';

export const calculateTokens = async (data: {
	uid: string;
	repo: string;
	model: supportModelType;
	messages: AiChatMessage[];
	type: 'prompt' | 'completion';
}) => {
	const { messages, model, uid, repo, type } = data;

	try {
		const { usedTokens, usedUSD } = new GPTTokens({ messages, model });
		warn({ usedTokens, usedUSD });

		await setUsageToUser(uid, repo, { usedTokens, usedUSD }, type);

		return { usedTokens, usedUSD };
	} catch (err) {
		const { usedTokens, usedUSD } = new GPTTokens({ messages, model: 'gpt-3.5-turbo' });
		warn({ usedTokens, usedUSD });

		await setUsageToUser(uid, repo, { usedTokens, usedUSD }, type);

		return { usedTokens, usedUSD };
	}
};

const setUsageToUser = async (
	uid: string,
	repo: string,
	usage: { usedTokens: number, usedUSD: number },
	type: 'prompt' | 'completion'
) => {
	const month = new Date().getMonth();
	const date = `${month < 10 ? '0' : ''}${month}_${new Date().getFullYear()}`;
	const docRef = firestore.doc(`users/${uid}/protected/usages/${repo}/${date}`);
	const doc = await docRef.get();
	const docData = doc.data();
	const createdAt = docData?.createdAt || new Date();
	const prompt = docData?.prompt || { usedTokens: 0, usedUSD: 0 };
	const completion = docData?.completion || { usedTokens: 0, usedUSD: 0 };

	if (type === 'prompt') {
		prompt.usedTokens = prompt.usedTokens + usage.usedTokens;
		prompt.usedUSD = parseInt((prompt.usedUSD + usage.usedUSD).toFixed(10));
		await docRef.set({
			prompt,
			createdAt,
			updatedAt: new Date(),
		}, { merge: true });
	} else {
		completion.usedTokens = completion.usedTokens + usage.usedTokens;
		completion.usedUSD = parseInt((completion.usedUSD + usage.usedUSD).toFixed(10));
		await docRef.set({
			completion,
			createdAt,
			updatedAt: new Date(),
		}, { merge: true });
	}
};
