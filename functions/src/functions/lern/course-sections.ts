import { createClient } from '@supabase/supabase-js';
import { codeBlock, oneLine } from 'common-tags';
import { DocumentReference } from 'firebase-admin/firestore';
import { warn } from 'firebase-functions/logger';
import OpenAI from 'openai';
import { CompletionUsage } from 'openai/resources';
import { ChatCompletionCreateParams, ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources/chat';
import { firestore } from '../../utils';
import { cappedContextMessages, setGlobalLernStatus, setGlobalLernUsage } from './common/utils';
import { validateCourseSectionArgs } from './common/validate-section-args';
import { LernCourse, LernCourseGenerationSection, LernCoursePlanGenerationSection, LernGenerationStatus, LernStepPreferences, LernUsage } from './models/lern.model';

const OPENAI_KEY = process.env.OPENAI_KEY;
const OPENAI_ORG = process.env.OPENAI_ORG;
const supabasePublicUrl = process.env.SUPABASE_PUBLIC_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const validateSection = (section?: LernCoursePlanGenerationSection) => {
	if (!section) return false;
	const title = !!section.title;
	const goals = (section.goals?.length ?? 0) > 0;
	const order = (section.order ?? 0) >= 0;
	const desc = (section.shortDescription ?? '').length > 0;
	return title && goals && order && desc;
};

const resetCourseSection = async (ref: DocumentReference) => {
	const statusRef = ref.collection('generation').doc('status');
	const statusDoc = await statusRef.get();

	const dataRef = ref.collection('generation').doc('data');
	const dataDoc = await dataRef.get();

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
		await dataRef.delete();
	}
};

const canGenerateSection = async (ref: DocumentReference, section: LernCoursePlanGenerationSection) => {
	const query = ref
		.collection('sections')
		.orderBy('order')
		.endBefore(section.order)
		.limitToLast(1);
	const sectionsDocs = await query.get();
	const docs = sectionsDocs.docs;
	const previousSectionData = docs?.at(0)?.data() as LernCoursePlanGenerationSection | undefined;

	if (docs.length <= 0 || !previousSectionData) return { canGenerate: true, previousSection: previousSectionData };

	const isValid = validateSection(previousSectionData);

	const statusRef = ref
		.collection('sections')
		.doc(previousSectionData.id)
		.collection('generation')
		.doc('status');
	const statusDoc = await statusRef.get();

	if (!statusDoc.exists) return { canGenerate: false, previousSection: previousSectionData };

	const statusData = statusDoc.data() as LernGenerationStatus | undefined;

	return {
		canGenerate: isValid && !!statusData?.completed,
		previousSection: previousSectionData,
	};
};

export const createLernCourseSection = async (
	uid: string,
	courseId: string,
	sectionId: string,
	section?: LernCoursePlanGenerationSection,
) => {
	warn(`Generating Lern Course Section => ${JSON.stringify({ uid, courseId, sectionId })}`);

	const courseRef = firestore.doc(`lern/${uid}/courses/${courseId}`);
	const sectionRef = courseRef.collection('sections').doc(sectionId);

	try {
		const course = (await courseRef.get()).data() as LernCourse | undefined;

		if (!OPENAI_KEY || !OPENAI_ORG) return await setErrorToCourseSection(sectionRef, 'server_error');

		if (!section) {
			const doc = await sectionRef.get();
			section = doc.data() as LernCoursePlanGenerationSection | undefined;
		}

		const isComplete = validateSection(section);
		if (!isComplete || !section || !course) return await setErrorToCourseSection(sectionRef, 'incomplete');

		await resetCourseSection(sectionRef);

		const { canGenerate, previousSection } = await canGenerateSection(courseRef, section);
		warn({ canGenerate, previousSection });

		if (!canGenerate) return await setErrorToCourseSection(sectionRef, 'not_ready');

		await setStatusToCourseSection(sectionRef, 'started', true);

		const userDocRef = firestore.doc(`users/${uid}`);
		const userDoc = await userDocRef.get();
		const user = userDoc.data();

		const openai = new OpenAI({
			apiKey: OPENAI_KEY,
			organization: OPENAI_ORG,
			maxRetries: 2,
			timeout: (540 / 2) * 1000,
		});

		await setErrorToCourseSection(sectionRef, 'none');

		const sections = await getPageSections(section, course.repo);

		const normName = user?.name.split(' ')[0] || 'User';
		const userName = (/^[a-zA-Z0-9_-]{1,64}$/).test(normName) ? normName : 'User';
		const preferences = getPreferencesBlock(course.preferences, section);

		const params = getCompletionParams({
			uid,
			repo: course.repo,
			userName,
			sections,
			preferences: course.preferences,
			normPreferences: preferences,
			previousSummary: previousSection?.content?.summary,
		});

		const chatCompletion = await openai.chat.completions.create(params as ChatCompletionCreateParamsNonStreaming);
		warn({ message: chatCompletion.choices[0].message, usage: chatCompletion.usage });

		await setUsage(sectionRef, { uid, course: courseId }, chatCompletion.usage);

		const functionCall = chatCompletion.choices[0].message.function_call;
		const args = functionCall?.name === 'createCourseSection' ? functionCall?.arguments : undefined;
		const finishReason = chatCompletion.choices[0].finish_reason;

		if (['content_filter', 'length'].includes(finishReason)) {
			await setErrorToCourseSection(sectionRef, finishReason === 'content_filter' ? 'stop_content_moderation' : 'stop_length');
			return;
		}

		const normArgs = validateCourseSectionArgs(args);

		return uploadGeneration(sectionRef, { uid, course: courseId }, section.order + 1, normArgs);
	} catch (err) {
		await setErrorToCourseSection(sectionRef, 'server_error');
		throw err;
	}
};

/**
 * Uploads a generation to the specified document reference.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @param {{ uid: string, course: string }} ids - The IDs of the user and course.
 * @param {number} nextOrder - The order of the next section.
 * @param {LernCourseGenerationSection} [res] - The generation section to upload.
 * @return {Promise<void>} - A promise that resolves when the upload is completed.
 */
const uploadGeneration = async (
	ref: DocumentReference,
	ids: { uid: string; course: string },
	nextOrder: number,
	res?: LernCourseGenerationSection,
): Promise<void> => {
	if (!res) return await setErrorToCourseSection(ref, 'hallucinate');

	warn('Generation completed');
	const docRef = ref.collection('generation').doc('data');
	const doc = await docRef.get();
	const data = doc.data() as LernCoursePlanGenerationSection | undefined;

	await docRef.set({
		content: res,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	}, { merge: true });

	await setStatusToCourseSection(ref, 'completed', true);
	await setGlobalLernStatus(ids, { addCompletedSection: true });

	await ref.update({
		sectionCompleted: true,
		updatedAt: new Date(),
	});

	const sectionsRef = ref.parent;
	if (!sectionsRef) return;

	const nextSectionQuery = sectionsRef.where('order', '==', nextOrder).limit(1);
	const nextSectionDoc = await nextSectionQuery.get();
	const nextSectionId = nextSectionDoc.docs.at(0)?.id;

	if (nextSectionId) {
		warn('Processing next section', nextSectionId);
		await sectionsRef.doc(nextSectionId).update({
			updatedAt: new Date(),
		});
	} else {
		await setGlobalLernStatus(ids, { completed: true, hasError: false });
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

	const PROMPT_USD = 0.03;
	const COMPLETION_USD = 0.06;

	const docRef = ref.collection('generation').doc('usage');
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
 * Generates the parameters for the completion of a chat message.
 *
 * @param {Object} data - The data object containing the necessary parameters for completion.
 * @return {ChatCompletionCreateParams} The parameters for the chat completion.
 */
const getCompletionParams = (data: {
	uid: string;
	repo: string;
	userName: string;
	sections: { title: string; content: string; rank: number }[];
	normPreferences: string;
	preferences?: LernStepPreferences;
	previousSummary?: string;
}): ChatCompletionCreateParams => {
	let {
		uid,
		repo,
		userName,
		sections,
		normPreferences,
		preferences,
		previousSummary,
	} = data;

	if (!preferences) {
		preferences = {
			contentDepth: 'beginner',
			duration: 'short',
			goal: 'knowledge',
			style: 'theory',
			assessment: 'quizz',
			language: 'English',
			revision: false,
		};
	}

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: codeBlock`
				${oneLine`
					You are a Tutor on the "${repo}" documentation. The user
					wants to learn some topics from this documentation. Use
					the 'createCourseSection' function to provide a comprehensive
					and in-depth lesson in "${preferences.language}", ensuring
					no redundancy or indications of upcoming content. The JSON
					for the function call must be minified and escape characters.
					Use a valid JSON in a single-line without whitespaces.
				`}
			`,
		},
	];

	if (previousSummary) {
		messages.push({
			role: 'assistant',
			name: 'CodeWiz',
			content: `This is a summary of your precedent lesson:\n\n${previousSummary}`,
		});
	}

	messages.push({
		role: 'user',
		name: userName,
		content: codeBlock`
			This is the ${repo} documentation:
			"""
			{{contextText}}
			"""

			Create a detailed course section that fulfills my requirements
			and preferences. Do NOT provide an overview or hint at upcoming
			content. Generate the full content of the lesson.

			Here are my preferences:
			${normPreferences}
		`,
	});

	const required = ['sectionTitle', 'content', 'summary'];

	if (preferences.assessment === 'quizz') {
		required.push('quiz');
	} else if (preferences.assessment === 'assignments') {
		required.push('assignment');
	}

	const functions: ChatCompletionCreateParams.Function[] = [
  {
    'name': 'createCourseSection',
    'description': oneLine`
      Generate a comprehensive Course Section in "${preferences.language}". This should
      provide an in-depth lesson tailored to the user's preferences. Avoids any
			indications of future content. Only accept a valid JSON in a single-line without
			whitespaces as arguments.
    `,
    'parameters': {
      'type': 'object',
      'properties': {
        'sectionTitle': {
          type: 'string',
          description: 'The title of the section.',
        },
        'content': {
          type: 'string',
          description: oneLine`
            The actual full content of this section/lesson. The content should answer the user's goals
            in a detailed and structured manner. Can include code snippets, examples, or plain formatted
            markdown text. Do not include section title, as it's already present in the page the user
            will see. This should be a standalone lesson, so avoid hinting at what will come next. Escape
						characters that will harm the validity of this JSON string.
          `,
        },
        ...(preferences.assessment === 'quizz'
          ? {
              'quiz': {
                'type': 'object',
                'properties': {
                  'question': {
                    'type': 'string',
                    'description': 'The question the User should answer to complete the knowledge review of this section.',
                  },
                  'quizType': {
                    'type': 'string',
                    'description': 'The type of quiz the user should answer. Either multiple answers or single answer.',
                    'enum': ['multi', 'single'],
                  },
                  'options': {
                    'type': 'array',
                    'items': {
                      'type': 'object',
                      'properties': {
                        'option': {
                          'type': 'string',
                          'description': 'A possible answer to the question. Based on the content of this section and the documentation provided by the User.',
                        },
                        'isCorrect': {
                          'type': 'boolean',
                          'description': 'Whether the answer is correct or not. Based on the content of this section and the documentation provided by the User.',
                        },
                        'why': {
                          'type': 'string',
                          'description': 'A reason why the answer is correct or not, in short. Based on the content of this section and the documentation provided by the User.',
                        },
                      },
                      'required': ['option', 'isCorrect'],
                    },
                  },
                },
                'required': ['question', 'quizType', 'options'],
              },
            }
          : {}),
        ...(preferences.assessment === 'assignments'
          ? {
              'assignment': {
                'type': 'string',
                'description': 'A description of the assignment you can suggest to the user to improve their learning.',
              },
            }
          : {}),
        'summary': {
          type: 'string',
          description: 'A short summary for this section. Summarize what the user should have achieved or understood by the end of this lesson.',
        },
      },
      'required': required,
    },
  },
	];

	warn({ functions });

	const model = 'gpt-3.5-turbo-0613';
	const maxCompletionTokenCount = 1500;

	const preParams = cappedContextMessages({
		messages,
		function_call: { name: 'createCourseSection' },
		functions,
		model,
	}, sections, maxCompletionTokenCount);

	const params: ChatCompletionCreateParams = {
		...preParams,
		max_tokens: maxCompletionTokenCount,
		temperature: 0.1,
		stream: false,
		user: uid,
	};

	return params;
};

/**
 * Generates the preferences block for a course.
 *
 * @param {LernCourse.preferences} preferences - The preferences object containing information about the course preferences.
 * @param {LernCoursePlanGenerationSection} section - An array of goals for the course.
 * @return {string} The generated preferences block.
 */
const getPreferencesBlock = (
	preferences: LernCourse['preferences'],
	section: LernCoursePlanGenerationSection,
): string => {
	if (!preferences) return '';

	const {
		contentDepth,
		goal,
		duration,
		style,
		assessment,
		language,
	} = preferences;

	const contentDepthDesc = {
		'beginner': 'Beginner. I am just starting out. I want a solid foundation. Use simple terms.',
		'intermediate': 'Intermediate. I already know the basics but I want to dive slightly deeper.',
		'advanced': 'Advanced. I already know the basics and I want to go deeper.',
	};

	const goalDesc = {
		'knowledge': 'I want to follow this course because I am really seeking knowledge acquisition.',
		'skill': 'I want to follow this course because I want to improve my skills regarding the main topic of this course.',
		'certification': 'I want to follow this course because I have an exam regarding the main topic of this course. I want to prepare.',
	};

	const durationDesc = {
		'short': 'From 1 to 3 Content Blocks. Quick and efficient insights to read this section in a short amount of time.',
		'medium': 'From 3 to 5 Content Blocks. A balanced dive into the subject.',
		'long': 'From 5 to 8 Content Blocks. A deep dive into the subject. Comprehensive mastery over the topic.',
	};

	const styleDesc = {
		'theory': 'I want to Understand the "why" behind concepts. I want a course that is more focused on theory.',
		'practical': 'Dive into real-world examples and code snippets. I want a course that is more focused on practical examples.',
	};

	const assignmentDesc = {
		'beginner': 'an easy assignment.',
		'intermediate': 'a short assignment.',
		'advanced': 'a short but strong assignment.',
	};

	const assessmentDesc = {
		'quizz': 'I want to practice my knowledge with quizzes.',
		'assignments': `I want to practice my knowledge with ${assignmentDesc[contentDepth]}.`,
	};

	return codeBlock`
		${oneLine`
			- Content Depth: "${contentDepthDesc[contentDepth] ?? ''}"
			- Why I want to follow this course: "${goalDesc[goal] ?? ''}"
			- Course Style: "${styleDesc[style] ?? ''}"
			- Assessments: ${assessment !== 'none' ? `${assessmentDesc[assessment] ?? ''}` : 'I do not want to practice with quizzes or assignments.'}
			- Duration: "${durationDesc[duration] ?? ''}"
			- Summaries: I want a quick TL;DR summary.
			- Course Language: I want to learn in "${language}".
			- The title of this section would be: ${section.title}.
			- The short description of this section would be: ${section.shortDescription}.
			- This section should focus on the following Goals:
			${section.goals.map((g) => `\t> ${g}`).join('\n')}
		`}
	`;
};

/**
 * Retrieves page sections based on the provided section and repository.
 *
 * @param {LernCoursePlanGenerationSection} section - The section to retrieve page sections for.
 * @param {string} repo - The repository to search in.
 * @return {Promise<{ title: string, content: string, rank: number }[]>} A promise that resolves to an array of page sections.
 */
const getPageSections = async (
	section: LernCoursePlanGenerationSection,
	repo: string
): Promise<{
    title: string;
    content: string;
    rank: number;
}[]> => {
	if (!supabasePublicUrl || !supabaseServiceRoleKey || !repo) return [];

	const supabase = createClient(supabasePublicUrl, supabaseServiceRoleKey);

	const query = codeBlock`
		${oneLine`
			${section.title} |
			${section.shortDescription} |
			${section.goals?.map((goal) => `- ${goal}`).join('\n')}
		`}
	`;

	warn('Getting Page Sections with query:', query);

	const { data, error: err } = await supabase.functions.invoke<{ id: string; rank: number; title: string; content: string }[]>('search', {
		body: JSON.stringify({ query, repo }),
	});

	if (err) throw err;

	return (data ?? []).map((d) => ({
		title: d.title,
		content: d.content,
		rank: d.rank,
	}));
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
 * Sets an error to a course section.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @param {string} warning - The warning string.
 * @return {Promise<void>} A promise that resolves when the error is set.
 */
const setErrorToCourseSection = async (
	ref: DocumentReference,
	warning: 'incomplete' | 'server_error' | 'not_ready' | 'stop_content_moderation' | 'stop_length' | 'hallucinate' | 'none'
): Promise<void> => {
	const docRef = ref.collection('generation').doc('status');
	const doc = await docRef.get();
	const data = doc.data() as LernGenerationStatus | undefined;
	const normData = {
		...data,
		error: warning,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};

	warn('Setting error to Course Section => ', warning);

	await docRef.set(normData, { merge: true });

	if (!['incomplete', 'not_ready', 'none'].includes(warning)) {
		await retryGeneration(ref);
	}
};

/**
 * Sets the status of a course section.
 *
 * @param {DocumentReference} ref - The reference to the document.
 * @param {('started' | 'completed')} status - The status to set ('started' or 'completed').
 * @param {boolean} value - The value to set for the status.
 * @return {Promise<void>} A promise that resolves when the status is set.
 */
const setStatusToCourseSection = async (
	ref: DocumentReference,
	status: 'started' | 'completed',
	value: boolean,
): Promise<void> => {
	const docRef = ref.collection('generation').doc('status');
	const doc = await docRef.get();
	const data = doc.data() as LernGenerationStatus | undefined;
	const normData = {
		...data,
		createdAt: data?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};

	warn('Updating Course Section Status to => ', status);

	if (status === 'started') {
		normData.started = value;
		if (value) normData.completed = false;
		await docRef.set(normData, { merge: true });
	} else if (status === 'completed') {
		normData.completed = value;
		await docRef.set(normData, { merge: true });
	}
};
