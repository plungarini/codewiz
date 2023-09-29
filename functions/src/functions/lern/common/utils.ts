import { oneLine } from 'common-tags';
import { log, warn } from 'firebase-functions/logger';
import { promptTokensEstimate } from 'openai-chat-tokens';
import { CompletionUsage } from 'openai/resources';
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources/chat';
import { firestore } from '../../../utils';
import { LernUsage } from '../models/lern.model';
import { getMaxTokenCount } from './tokenizer';

type PartialParams = {
	messages: ChatCompletionMessageParam[];
	function_call: ChatCompletionCreateParams.FunctionCallOption;
	functions: ChatCompletionCreateParams.Function[];
	model: string;
}

export const cappedContextMessages = (
	params: PartialParams,
	sections: { title: string; content: string; rank: number }[],
	maxCompletionTokenCount: number,
): PartialParams => {
	const { model, messages } = params;
	const maxTotalTokenCount = getMaxTokenCount(model) - maxCompletionTokenCount;

	// Clone messages array to ensure original isn't affected
	const cappedInitMessages = [...messages];
	const index = cappedInitMessages.findIndex((message) => message.content?.includes('{{contextText}}'));

	if (index <= -1) {
		return {
			...params,
			messages: cappedInitMessages,
		};
	}

	// Store the original format before any replacements
	const originalFormat = cappedInitMessages[index].content;

	let contextText: string;
	let tokenCount: number;
	let tries = 0;

	const updateContent = () => {
		contextText = oneLine(sections.map((section) => (`${section.title}\n${section.content}`).trim()).join('---').trim());
		cappedInitMessages[index].content = originalFormat?.replace('{{contextText}}', contextText) ?? null;
	};

	updateContent(); // Initial update

	tokenCount = promptTokensEstimate({
		messages: cappedInitMessages,
		functions: params.functions,
		function_call: params.function_call,
	});

	warn({ tokenCount, maxTotalTokenCount });

	// Remove low ranked context messages until we fit
	while (tokenCount >= maxTotalTokenCount && tries < 10) {
		sections = sections.slice(0, sections.length - 1);
		updateContent();

		tokenCount = promptTokensEstimate({
			messages: cappedInitMessages,
			functions: params.functions,
			function_call: params.function_call,
		});

		tries++;
	}

	if (tries >= 10) {
		throw new Error('Failed to cap context messages');
	}

	warn(`Capped messages to ${tokenCount} tokens.`);

	return {
		...params,
		messages: cappedInitMessages,
	};
};

export /**
 * Sets the global status of a course generation process.
 *
 * @param {Object} ref - The reference object containing the unique identifier (uid) and course id for the generation status.
 * @param {Object} data - The partial object containing the updated values for the generation status.
 * @return {Promise<void>} A promise that resolves when the global status is updated.
 */
const setGlobalLernStatus = async (
	ref: {
		uid: string;
		course: string;
	},
	data: Partial<{
		started: boolean;
		completed: boolean;
		planCompleted: boolean;
		totalSections: number;
		completedSections: number;
		addCompletedSection: boolean;
		hasError: boolean;
	}>
): Promise<void> => {
	const globalStatusRef = firestore.doc(`lern/${ref.uid}/courses/${ref.course}/generation/status`);
	const globalStatusDoc = await globalStatusRef.get();
	const globalStatus = globalStatusDoc.data();

	const normGlobalStatus = {
		started: true,
		completed: false,
		planCompleted: false,
		totalSections: 0,
		completedSections: 0,
		hasError: false,
		...globalStatus,
		createdAt: globalStatus?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};

	if (data.started !== undefined) {
		normGlobalStatus.started = data.started;
	}
	if (data.completed !== undefined) {
		normGlobalStatus.completed = data.completed;
		normGlobalStatus.started = data.completed ? false : normGlobalStatus.started;
	}
	if (data.planCompleted !== undefined) {
		normGlobalStatus.planCompleted = data.planCompleted;
	}
	if (data.totalSections !== undefined) {
		normGlobalStatus.totalSections = data.totalSections;
	}
	if (data.completedSections !== undefined) {
		normGlobalStatus.completedSections = data.completedSections;
	}
	if (data.addCompletedSection !== undefined) {
		normGlobalStatus.completedSections = normGlobalStatus.completedSections + 1;
	}
	if (data.hasError !== undefined) {
		normGlobalStatus.hasError = data.hasError;
	}

	globalStatusRef.set(normGlobalStatus, { merge: true });
};


/**
 * Sets the global usage for a Lern course.
 *
 * @param {Object} ref - The reference object containing the UID and course name.
 * @param {Object} usage - The completion usage object.
 * @param {string} ref.uid - The UID of the user.
 * @param {string} ref.course - The name of the course.
 * @param {number} usage.prompt_tokens - The number of prompt tokens used.
 * @param {number} usage.completion_tokens - The number of completion tokens used.
 * @param {number} usage.total_tokens - The total number of tokens used.
 * @return {Promise<void>} A promise that resolves when the global usage is set.
 */
export const setGlobalLernUsage = async (
	ref: {
		uid: string;
		course: string;
	},
	usage: CompletionUsage,
): Promise<void> => {
	if (!usage) return warn('Unable to set Global Usage for Lern Course.');

	const PROMPT_USD = 0.0015;
	const COMPLETION_USD = 0.002;

	const docRef = firestore.doc(`lern/${ref.uid}/courses/${ref.course}/generation/usage`);
	const doc = await docRef.get();
	const data = doc.data() as LernUsage | undefined;
	const prompt = data?.prompt ?? { tokens: 0, usd: 0 };
	const completion = data?.completion ?? { tokens: 0, usd: 0 };
	const total = data?.total ?? { tokens: 0, usd: 0 };

	prompt.tokens += usage.prompt_tokens;
	completion.tokens += usage.completion_tokens;
	total.tokens += usage.total_tokens;

	prompt.usd += (usage.prompt_tokens / 1000) * PROMPT_USD;
	completion.usd += (usage.completion_tokens / 1000) * COMPLETION_USD;
	total.usd += prompt.usd + completion.usd;

	const normData = {
		prompt,
		completion,
		total,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};

	warn('Setting Course usage =>', normData);

	await docRef.set(normData, { merge: true });
};


export const parseArgs = <T>(args: string): T | undefined => {
	const regexReplacers: { regex: RegExp, replacer: string }[] = [
		// Trailing commas
		{ regex: /,\s*([\]}])/gm, replacer: '$1' },
		// Remove double commas (,\s,)
		{ regex: /,\s*(,)/gm, replacer: '$1' },
		// Unquoted properties
		{ regex: /(['"{[])?([a-zA-Z0-9]+)(['"])?:(\s)?(true|false|(\d+)|'|")/gm, replacer: '"$2": $5' },
		// Single quoted values
    { regex: /:(\s*)'((?:\\.|[^'"])+)'/gm, replacer: ': "$2"' },
	];

	let tempString = args;
	for (let i = 0; i <= regexReplacers.length; i++) {
		try {
			if (i > 0) log(`[${i}] Sanitized: `, tempString);
			return JSON.parse(tempString);
		} catch {
			if (i < regexReplacers.length) {
				tempString = tempString.replace(regexReplacers[i].regex, regexReplacers[i].replacer);
			}
		}
	}
	return undefined;
};
