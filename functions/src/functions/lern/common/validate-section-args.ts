import { warn } from 'firebase-functions/logger';
import { LernCourseGenerationSection } from '../models/lern.model';
import { parseArgs } from './utils';

export const validateCourseSectionArgs = (
  args?: string,
): LernCourseGenerationSection | undefined => {
	if (!args) {
		warn('No args received', 'HALLUCINATING');
		return undefined;
	}

  warn('Validating args', args);

  const normArgs = typeof args === 'string' ? parseArgs<LernCourseGenerationSection>(args) : args;
	if (!normArgs) {
		warn('Unable to parse JSON', 'HALLUCINATING');
		return undefined;
	}

	if (!areQuizOptionsValid(normArgs.quiz)) {
		warn('Invalid quiz options', 'HALLUCINATING');
		return undefined;
	}

	if (!isAssignmentValid(normArgs.assignment)) {
		warn('Invalid assignment', 'HALLUCINATING');
		return undefined;
	}

	if (!isValidSectionName(normArgs.sectionTitle)) {
		warn('Invalid section name', 'HALLUCINATING');
		return undefined;
	}

	if (!isContentValid(normArgs.content)) {
		warn('Invalid content', 'HALLUCINATING');
		return undefined;
	}

	if (!isValidTldr(normArgs.tldr)) {
		warn('Invalid TL;DR', 'HALLUCINATING');
		return undefined;
	}

	return {
		sectionTitle: normArgs.sectionTitle,
		content: normArgs.content,
		quiz: normQuiz(normArgs.quiz),
		assignment: normArgs.assignment,
		tldr: normArgs.tldr,
  };
};

const isValidSectionName = (sectionName: string | undefined): boolean => {
  return !!sectionName && typeof sectionName === 'string';
};

const isContentValid = (content: string): boolean => {
	return !!content && typeof content === 'string';
};

const areQuizOptionsValid = (quiz: LernCourseGenerationSection['quiz']): boolean => {
  if (!quiz) return true;

	if (!['single', 'multi'].includes(quiz.quizType)) {
		return false;
	}

	const quizzes = normQuiz(quiz);
	const optionsValid = (quizzes?.options.length ?? 0) > 0 && quizzes?.options.every((option) => {
		return !!option.option &&
			typeof option.option === 'string' &&
			option.isCorrect !== undefined &&
			(!option.why || typeof option.why === 'string');
	});

  return !!optionsValid;
};

const isAssignmentValid = (assignment: LernCourseGenerationSection['assignment']): boolean => {
	if (!assignment) return true;
	return typeof assignment === 'string';
};

const isValidTldr = (tldr: string): boolean => {
	return !!tldr && typeof tldr === 'string';
};

const normQuiz = (quiz: LernCourseGenerationSection['quiz']): LernCourseGenerationSection['quiz'] => {
	return quiz ? {
		question: quiz.question,
		quizType: quiz.quizType,
		options: quiz.options
			.filter((option) => !!option.option && typeof option.option === 'string' && typeof option.isCorrect === 'boolean')
			.map((option) => {
				return {
					option: option.option,
					isCorrect: !!option.isCorrect,
					why: option.why ?? '',
				};
			}),
	} : undefined;
};
