import { error, warn } from 'firebase-functions/logger';
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

	if (!repo || !uid) return error('Error on calculateTokens, repo or uid is undefined', { repo, uid, type });

	warn(`Calculating tokens for ${type}...`);

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
	if (!repo || !uid) return error('Error on setUsageToUser, repo or uid is undefined', { repo, uid });

	warn(`Setting usage to ${uid} for ${type}...`);

	const month = new Date().getMonth();
	const date = `${month < 10 ? '0' : ''}${month}_${new Date().getFullYear()}`;
	const docRef = firestore.doc(`users/${uid}/protected/usages/${repo}/${date}`);
	const doc = await docRef.get();
	const docData = doc.data();
	const exists = doc.exists;

	const createdAt = docData?.createdAt || new Date();
	const prompt = docData?.prompt || { usedTokens: 0, usedUSD: 0 };
	const completion = docData?.completion || { usedTokens: 0, usedUSD: 0 };

	if (type === 'prompt') {
		prompt.usedTokens = prompt.usedTokens + usage.usedTokens;
		prompt.usedUSD = parseFloat((prompt.usedUSD + usage.usedUSD).toFixed(10));

		if (!exists) {
			await docRef.set({
				prompt,
				createdAt,
				updatedAt: new Date(),
			}, { merge: true });
		} else {
			await docRef.update({
				prompt,
				updatedAt: new Date(),
			});
		}
	} else {
		completion.usedTokens = completion.usedTokens + usage.usedTokens;
		completion.usedUSD = parseFloat((completion.usedUSD + usage.usedUSD).toFixed(10));

		if (!exists) {
			await docRef.set({
				completion,
				createdAt,
				updatedAt: new Date(),
			}, { merge: true });
		} else {
			await docRef.update({
				completion,
				updatedAt: new Date(),
			});
		}
	}

	try {
		await saveUsageToStats(repo, usage, type);
	} catch (err) {
		error('Error on saveUsageToStats', err);
	}
};

const saveUsageToStats = async (repo: string, usage: { usedTokens: number, usedUSD: number }, type: 'prompt' | 'completion') => {
	warn(`Saving usage to general stats for ${type}...`);

	const docPath = `stats/completions/repos/${repo}`;
	const docRef = firestore.doc(docPath);
	const doc = await docRef.get();
	const docData = doc.data();
	const exists = doc.exists;

	const createdAt = docData?.createdAt || new Date();
	let totalTokensPrompt = docData?.prompt?.totalTokens || 0;
	let totalUSDPrompt = docData?.prompt?.totalUSD || 0;
	let totalTokensCompletion = docData?.completion?.totalTokens || 0;
	let totalUSDCompletion = docData?.completion?.totalUSD || 0;
	let totalPrompts = docData?.prompt?.count || 0;
	let totalCompletions = docData?.completion?.count || 0;

	if (type === 'prompt') {
		totalTokensPrompt = totalTokensPrompt + usage.usedTokens;
		totalUSDPrompt = parseFloat((totalUSDPrompt + usage.usedUSD).toFixed(10));
		totalPrompts = totalPrompts + 1;
		const averageTokensPerPrompt = totalTokensPrompt / totalPrompts;
		const averageUSDPerPrompt = parseFloat((totalUSDPrompt / totalPrompts).toFixed(10));

		const prompt = {
			totalTokens: totalTokensPrompt,
			totalUSD: totalUSDPrompt,
			averageTokensPerPrompt,
			averageUSDPerPrompt,
			count: totalPrompts,
		};

		if (!exists) {
			await docRef.set({
				prompt,
				createdAt,
				updatedAt: new Date(),
			}, { merge: true });
		} else {
			await docRef.update({
				prompt,
				updatedAt: new Date(),
			});
		}
	} else {
		totalTokensCompletion = totalTokensCompletion + usage.usedTokens;
		totalUSDCompletion = parseFloat((totalUSDCompletion + usage.usedUSD).toFixed(10));
		totalCompletions = totalCompletions + 1;
		const averageTokensPerCompletion = totalTokensCompletion / totalCompletions;
		const averageUSDPerCompletion = parseFloat((totalUSDCompletion / totalCompletions).toFixed(10));

		const completion = {
			totalTokens: totalTokensCompletion,
			totalUSD: totalUSDCompletion,
			averageTokensPerCompletion,
			averageUSDPerCompletion,
			count: totalCompletions,
		};

		if (!exists) {
			await docRef.set({
				completion,
				createdAt,
				updatedAt: new Date(),
			}, { merge: true });
		} else {
			await docRef.update({
				completion,
				updatedAt: new Date(),
			});
		}
	}
};
