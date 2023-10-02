import { Pezzo, PezzoOpenAI } from '@pezzo/client';
import { codeBlock, oneLine } from 'common-tags';
import { DocumentReference } from 'firebase-admin/firestore';
import { error, warn } from 'firebase-functions/logger';
import { CompletionUsage } from 'openai/resources';
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources/chat';
import { firestore, production } from '../../utils';
import { cappedContextMessages, setGlobalLernStatus, setGlobalLernUsage } from './common/utils';
import { normalizeSections, validateCoursePlanArgs } from './common/validate-plan-args';
import {
	LernCourse,
	LernCoursePlanGeneration,
	LernCoursePlanGenerationSection,
	LernGenerationStatus,
	LernStepPreferences,
	LernStepTopic,
	LernUsage,
} from './models/lern.model';

const OPENAI_KEY = process.env.OPENAI_KEY;
const OPENAI_ORG = process.env.OPENAI_ORG;
const PEZZO_API_KEY = process.env.PEZZO_API_KEY;
const PEZZO_PROJECT_ID = process.env.PEZZO_PROJECT_ID;

const validateCourse = (course?: LernCourse) => {
	const hasPages = (course?.topic?.pages?.length ?? 0) > 0;
	const hasQuery = !!course?.topic?.query;
	const hasPreferences = !!course?.preferences;

	return !!course && hasPages && hasQuery && hasPreferences;
};

const resetCoursePlan = async (docRef: DocumentReference) => {
	const statusRef = docRef.collection('plan').doc('status');
	const statusDoc = await statusRef.get();

	const dataRef = docRef.collection('plan').doc('data');
	const dataDoc = await dataRef.get();

	const sectionsRef = docRef.collection('sections');
	const sectionsDocs = await sectionsRef.listDocuments();

	const globalStatusRef = docRef.collection('generation').doc('status');
	const globalStatusDoc = await globalStatusRef.get();

	if (globalStatusDoc.exists) {
		await globalStatusRef.set({
			...globalStatusDoc.data(),
			completed: false,
			started: false,
			planCompleted: false,
			totalSections: 0,
			completedSections: 0,
			hasError: false,
			updatedAt: new Date(),
		}, { merge: true });
	}

	const bulkWriter = firestore.bulkWriter();
	bulkWriter
		.onWriteError((err) => {
			if (
				err.failedAttempts < 5
			) {
				return true;
			} else {
				error('Failed write at document: ', err.documentRef.path);
				return false;
			}
		});

	if (statusDoc.exists) {
		await statusRef.set({
			...statusDoc.data(),
			completed: false,
			started: false,
			error: 'none',
			updatedAt: new Date(),
		});
	}

	if (dataDoc.exists) {
		dataRef.delete();
	}

	for (const section of sectionsDocs) {
		const doc = await section.get();
		if (doc.exists) {
			const sectionRef = docRef.collection('sections').doc(doc.id);
			await firestore.recursiveDelete(sectionRef, bulkWriter);
		}
	}
};

const getOpenAi = () => {
	const pezzo = new Pezzo({
		apiKey: PEZZO_API_KEY,
		environment: production() ? 'Production' : 'Development',
		projectId: PEZZO_PROJECT_ID,
	});

	return new PezzoOpenAI(pezzo, {
		apiKey: OPENAI_KEY,
		organization: OPENAI_ORG,
		maxRetries: 2,
		timeout: (540 / 2) * 1000,
	});
};

export const createLernCoursePlan = async (uid: string, id: string, course?: LernCourse) => {
	warn(`Initializing new Lern Course Plan for user ${uid} | Course ID: ${id}`);

	const docRef = firestore.doc(`lern/${uid}/courses/${id}`);

	try {
		if (!course) {
			const doc = await docRef.get();
			course = doc.data() as LernCourse | undefined;
		}

		const isComplete = validateCourse(course);

		if (!isComplete) return await setErrorToCourse(docRef, 'incomplete');

		await resetCoursePlan(docRef);
		await setStatusToCoursePlan(docRef, 'started', true);
		await setGlobalLernStatus({ uid, course: id }, { started: true });

		const userDocRef = firestore.doc(`users/${uid}`);
		const userDoc = await userDocRef.get();
		const user = userDoc.data();

		/* TODO: Check if user can generate based on subscription credits */

		const openai = getOpenAi();

		const { repo, topic, preferences } = course as LernCourse;

		if (!repo || !topic || !preferences) return await setErrorToCourse(docRef, 'incomplete');

		const sections = (topic?.pages ?? []).map((section, i) => {
			return { title: section?.title ?? '', content: section?.content ?? '', rank: i };
		}).sort((a, b) => a.rank - b.rank);

		const normPreferences = getPreferencesBlock(preferences);
		const normName = user?.name.split(' ')[0] || 'User';
		const userName = (/^[a-zA-Z0-9_-]{1,64}$/).test(normName) ? normName : 'User';

		const params = getCompletionParams({
			uid,
			repo,
			userName,
			sections,
			topic,
			preferences,
			normPreferences,
		});

		const chatCompletion = await openai.chat.completions.create(params, {
			stream: false,
			properties: {
				uid,
				prompt: 'createCoursePlan',
			},
		});

		warn({ message: chatCompletion.choices[0].message, usage: chatCompletion.usage });

		const functionCall = chatCompletion.choices[0].message.function_call;
		const args = functionCall?.name === 'createCoursePlan' ? functionCall?.arguments : undefined;
		const finishReason = chatCompletion.choices[0].finish_reason;

		await setUsage(docRef, { uid, course: id }, chatCompletion.usage);

		if (['content_filter', 'length'].includes(finishReason)) {
			await setErrorToCourse(docRef, finishReason === 'content_filter' ? 'stop_content_moderation' : 'stop_length');
			return;
		}

		const normArgs = validateCoursePlanArgs(args);

		if (!normArgs) {
			await setErrorToCourse(docRef, 'hallucinate');
			return;
		}

		return uploadGeneration({ uid, course: id }, docRef, normArgs);
	} catch (err) {
		await setErrorToCourse(docRef, 'server_error');
		throw err;
	}
};

/**
 * Uploads the course plan generation data and updates the database accordingly.
 *
 * @param {Object} ids - The IDs of the user and the course.
 * @param {string} ids.uid - The user ID.
 * @param {string} ids.course - The course ID.
 * @param {DocumentReference} ref - The reference to the document in the database.
 * @param {LernCoursePlanGeneration} res - The course plan generation data to be uploaded.
 * @return {Promise<void>} A Promise that resolves when the upload is completed.
 */
const uploadGeneration = async (
	ids: { uid: string; course: string; },
	ref: DocumentReference,
	res: LernCoursePlanGeneration,
): Promise<void> => {
	warn('Generation completed');
	const docRef = ref
		.collection('plan')
		.doc('data');
	const doc = await docRef.get();
	const data = doc.data() as LernCoursePlanGeneration | undefined;
	await docRef.set({
		...data,
		...res,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	}, { merge: true });

	const sections = normalizeSections(res.sections);

	await setGlobalLernStatus({
		uid: ids.uid,
		course: ids.course,
	}, {
		started: true,
		completed: false,
		planCompleted: true,
		totalSections: sections.length,
		completedSections: 0,
		hasError: false,
	});

	for (const section of sections) {
		const sectionRef = ref.collection('sections').doc();
		const id = sectionRef.id;
		const sectionDoc = await sectionRef.get();
		const sectionData = sectionDoc.data() as LernCoursePlanGenerationSection | undefined;
		const normSection = {
			...sectionData,
			...section,
			createdAt: sectionData?.createdAt ?? new Date(),
			updatedAt: new Date(),
		};

		normSection.id = id;
		await sectionRef.set(normSection, { merge: true });
	}

	await ref.update({
		name: res.courseName,
		planCreated: true,
		updatedAt: new Date(),
	});

	await setStatusToCoursePlan(ref, 'completed', true);
};

/**
 * Sets an error to a course.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @param {'incomplete' | 'server_error'} warning - The type of warning.
 * @return {Promise<void>} A promise that resolves when the error has been set.
 */
const setErrorToCourse = async (
	ref: DocumentReference,
	warning: 'incomplete' | 'server_error' | 'stop_content_moderation' | 'stop_length' | 'hallucinate' | 'none'
): Promise<void> => {
	const docRef = ref.collection('plan').doc('status');
	const doc = await docRef.get();
	const data = doc.data() as LernGenerationStatus | undefined;
	const normData = {
		...data,
		error: warning,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};

	warn('Setting error to Course plan => ', warning);

	await docRef.set(normData, { merge: true });

	if (!['incomplete', 'none'].includes(warning)) {
		await retryGeneration(ref);
	}
};

/**
 * Retry generation for a given document reference.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @return {Promise<void>} A promise that resolves when the generation is retried.
 */
const retryGeneration = async (
	ref: DocumentReference,
): Promise<void> => {
	const doc = await ref.get();
	const data = doc.data();
	const normData = {
		...data,
		tries: (data?.tries ?? 0) + 1,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};
	await ref.set(normData, { merge: true });
};

/**
 * Sets the status of a course.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @param {string} status - The status of the course ('started' or 'completed').
 * @param {boolean} value - The value to set for the status.
 * @return {Promise<void>} A promise that resolves when the status has been set.
 */
const setStatusToCoursePlan = async (
	ref: DocumentReference,
	status: 'started' | 'completed',
	value: boolean,
): Promise<void> => {
	const docRef = ref.collection('plan').doc('status');
	const doc = await docRef.get();
	const data = doc.data() as LernGenerationStatus | undefined;
	const normData = {
		...data,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};

	warn('Updating Section Status to => ', status);

	if (status === 'started') {
		normData.started = value;
		if (value) normData.completed = false;
		await docRef.set(normData, { merge: true });
	} else if (status === 'completed') {
		normData.completed = value;
		await docRef.set(normData, { merge: true });
	}
};

/**
 * Sets the usage data for a specific document reference.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @param {{ uid: string, course: string }} ids - The IDs used for setting the usage.
 * @param {CompletionUsage} [usage] - The usage data to be set (optional).
 * @return {Promise<void>} - A Promise that resolves when the usage is set.
 */
const setUsage = async (
	ref: DocumentReference,
	ids: { uid: string; course: string; },
	usage?: CompletionUsage,
): Promise<void> => {
	if (!usage) return warn('Unable to set usage for Lern Course.');

	const PROMPT_USD = 0.0015;
	const COMPLETION_USD = 0.002;

	const docRef = ref.collection('plan').doc('usage');
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
	await setGlobalLernUsage(ids, usage);
};

/**
 * Generates the parameters for the chat completion request.
 *
 * @param {Object} data - The data object containing the following properties:
 *   - uid {string}: The user ID.
 *   - repo {string}: The repository name.
 *   - userName {string}: The name of the user.
 *   - contextText {string}: The context text.
 *   - topic {LernStepTopic}: The topic object of the course.
 *   - preferences {LernStepPreferences}: The user's preferences.
 *   - normPreferences {string}: The normalized preferences.
 * @return {ChatCompletionCreateParams} The parameters for the chat completion request.
 */
const getCompletionParams = (data: {
	uid: string;
	repo: string;
	userName: string;
	sections: { title: string; content: string; rank: number }[];
	topic: LernStepTopic;
	preferences: LernStepPreferences;
	normPreferences: string;
}) => {
	const {
		uid,
		repo,
		userName,
		sections,
		normPreferences,
		preferences,
		topic,
	} = data;

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: codeBlock`
				${oneLine`
					You are an Tutor on the "${repo}" documentation. The user
					wants to learn some topics of this documentation. Use
					function 'createCoursePlan' to provide him with the best
					possible answer in "${preferences.language}".
				`}
			`,
		},
		{
			role: 'user',
			name: userName,
			content: codeBlock`
				Based on the provided ${repo} documentation:
				"""
				{{contextText}}
				"""

				I want to learn:
				"""
				${topic?.query ?? '[No question provided]'}
				"""

				I want that you write a course plan tailored to my needs.
				Here are my preferences:
				${normPreferences}

				I want you to provide me with a course plan tailored to this
				topic. Use the function 'createCoursePlan' to generate a course.
			`,
		},
	];

	const sectionsDesc = {
		'short': 'From 3 to 5 Sections maximum.',
		'medium': 'From 5 to 8 Sections maximum.',
		'long': 'From 8 to 10 Sections maximum.',
	};

	const functions: ChatCompletionCreateParams.Function[] = [
		{
			'name': 'createCoursePlan',
			'description': oneLine`
				Generate a course plan written in "${preferences.language}" based on user preferences.
				Only accept valid json as arguments.
			`,
			'parameters': {
				'type': 'object',
				'properties': {
					'courseName': {
						'type': 'string',
						'description': 'A name for the course. Maximum 40 chars.',
					},
					'shortDescription': {
						'type': 'string',
						'description': 'A short description for the course. It should introduce in short what the course is about. Around 250 chars of length.',
					},
					'sections': {
						'type': 'array',
						'description': `An array of Course Section. Each Section should focus on one main small topic. ${sectionsDesc[preferences.duration]}`,
						'items': {
							'type': 'object',
							'properties': {
								'title': {
									'type': 'string',
									'description': 'A title for this section.',
								},
								'order': {
									'type': 'number',
									'description': 'The order of this section regarding other sections.',
								},
								'goals': {
									'type': 'array',
									'description': oneLine`What the user should learn in this section. These should be easy
									goals that can be presented in a short article. DO NOT include external sources like
									"StackBlitz". Goals should be small tasks. Minimum of 1 goal, Maximum of
									${preferences.duration === 'long' ? 5 : 3} goals.`,
									'items': {
										'type': 'string',
									},
								},
								'shortDescription': {
									'type': 'string',
									'description': 'A short description for this section. Maximum 150 chars.',
								},
							},
						},
					},
					'prerequisites': {
						type: 'array',
						description: 'An array of prerequisites for the course. 3-5 options.',
						items: {
							type: 'string',
							description: 'A prerequisite for the course. Maximum 40 chars.',
						},
					},
				},
				'required': ['courseName', 'shortDescription', 'sections', 'prerequisites'],
			},
		},
	];

	const model = 'gpt-3.5-turbo-0613';
	const maxCompletionTokenCount = 1024;

	const preParams = cappedContextMessages({
		messages,
		function_call: 'auto',
		functions,
		model,
	}, sections, maxCompletionTokenCount);

	const params: ChatCompletionCreateParams = {
		...preParams,
		max_tokens: maxCompletionTokenCount,
		temperature: 0.75,
		stream: false,
		user: uid,
	};

	return params;
};

/**
 * Generates a preferences block based on the provided preferences object.
 *
 * @param {LernCourse.preferences} preferences - The preferences object containing information about the course preferences.
 * @return {string} The generated preferences block as a string.
 */
const getPreferencesBlock = (preferences: LernCourse['preferences']): string => {
	if (!preferences) return '';

	const {
		contentDepth,
		duration,
		goal,
		style,
		assessment,
		revision,
		language,
	} = preferences;

	const contentDepthDesc = {
		'beginner': 'Beginner. I am just starting out. I want a solid foundation.',
		'intermediate': 'Intermediate. I already know the basics but I want to dive slightly deeper.',
		'advanced': 'Advanced. I already know the basics and I want to go deeper.',
	};

	const durationDesc = {
		'short': 'From 3 to 5 Sections. Quick and efficient insights to read the course in a short amount of time.',
		'medium': 'From 5 to 8 sections. A balanced dive into the subject, to read the course in a medium amount of time.',
		'long': 'From 8 to 10 sections. A deep dive into the subject, to read the course in a long amount of time. Comprehensive mastery over the topic.',
	};

	const goalDesc = {
		'knowledge': 'I am really seeking knowledge acquisition.',
		'skill': 'I want to improve my skills regarding this topic.',
		'certification': 'I have an exam regarding this topic. I want to prepare.',
	};

	const styleDesc = {
		'theory': 'I want to Understand the "why" behind concepts. I want a course that is more focused on theory.',
		'practical': 'Dive into real-world examples and code snippets. I want a course that is more focused on practical examples.',
	};

	const assessmentDesc = {
		'quizz': 'I want to practice my knowledge with quizzes, frequently.',
		'assignments': 'I want to practice my knowledge with assignments.',
	};

	return codeBlock`
		${oneLine`
			- Content Depth: "${contentDepthDesc[contentDepth] ?? ''}"
			- Course Sections: "${durationDesc[duration] ?? ''}"
			- Goal of the course: "${goalDesc[goal] ?? ''}"
			- Course Style: "${styleDesc[style] ?? ''}"
			${assessment !== 'none' ? `- Assessments: ${assessmentDesc[assessment] ?? ''}` : ''}
			${revision ? '- Summaries: At the end of each section I want a quick TL;DR summary.' : ''}
			- Every Course Section should focus on one main topic/goal, with small tasks.
			- Course Language: I want to learn in "${language}".
		`}
	`;
};
