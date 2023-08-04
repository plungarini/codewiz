import { warn } from 'firebase-functions/logger';
import { GPTTokens, supportModelType } from 'gpt-tokens';
import { AiChatMessage } from '../../models/tiktoken/tiktoken.model';
import { firestore } from '../../utils';

export const calculateTokens = async (data: {
	uid: string,
	repo: string,
	model: supportModelType,
	messages: AiChatMessage[],
}) => {
	const { messages, model, uid, repo } = data;

	try {
		const { usedTokens, usedUSD } = new GPTTokens({ messages, model });
		warn({ usedTokens, usedUSD });

		await setUsageToUser(uid, repo, { usedTokens, usedUSD });

		return { usedTokens, usedUSD };
	} catch (err) {
		const { usedTokens, usedUSD } = new GPTTokens({ messages, model: 'gpt-3.5-turbo' });
		warn({ usedTokens, usedUSD });

		await setUsageToUser(uid, repo, { usedTokens, usedUSD });

		return { usedTokens, usedUSD };
	}
};

const setUsageToUser = async (uid: string, repo: string, usage: { usedTokens: number, usedUSD: number }) => {
	const month = new Date().getMonth();
	const date = `${month < 10 ? '0' : ''}${month}_${new Date().getFullYear()}`;
	const docRef = firestore.doc(`users/${uid}/protected/usages/${repo}/${date}`);
	const doc = await docRef.get();
	const createdAt = doc.data()?.createdAt || new Date();
	const usedTokensDb = doc.data()?.usedTokens || 0;
	const usedUsdDb = doc.data()?.usedUSD || 0;

	await docRef.set({
		usedTokens: usedTokensDb + usage.usedTokens,
		usedUSD: parseFloat(usedUsdDb + usage.usedUSD.toFixed(10)),
		createdAt,
		updatedAt: new Date(),
	}, { merge: true });
};
