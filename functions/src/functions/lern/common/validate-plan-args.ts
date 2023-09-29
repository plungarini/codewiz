import { warn } from 'firebase-functions/logger';
import { LernCoursePlanGeneration, LernCoursePlanGenerationSection } from '../models/lern.model';
import { parseArgs } from './utils';

/**
 * Validates the arguments for generating a LernCoursePlan.
 *
 * @param {string} args - The arguments for generating the course plan in JSON format.
 * @return {Promise<LernCoursePlanGeneration | undefined>} The normalized arguments for generating the course plan, or undefined if the arguments are invalid.
 */
export const validateCoursePlanArgs = (
  args?: string,
): LernCoursePlanGeneration | undefined => {
  if (!args) return undefined;

  warn('Validating args', args);

  const normArgs = typeof args === 'string' ? parseArgs<LernCoursePlanGeneration>(args) : args;
	if (!normArgs) {
		warn('Unable to parse JSON', 'HALLUCINATING');
		return undefined;
	}

	if (!isValidCourseName(normArgs.courseName)) {
		warn('Invalid course name', 'HALLUCINATING');
		return undefined;
	}
	if (!isValidDescription(normArgs.shortDescription)) {
		warn('Invalid course description', 'HALLUCINATING');
		return undefined;
	}
	if (!areSectionsValid(normArgs.sections)) {
		warn('Invalid sections', 'HALLUCINATING');
		return undefined;
	}
	if (!arePrerequisitesValid(normArgs.prerequisites)) {
		warn('Invalid prerequisites', 'HALLUCINATING');
		return undefined;
	}

  return {
		courseName: normArgs.courseName,
		shortDescription: normArgs.shortDescription,
    sections: normalizeSections(normArgs.sections),
    prerequisites: normArgs.prerequisites,
  };
};

const isValidCourseName = (courseName: string | undefined): boolean => {
  return !!courseName && typeof courseName === 'string';
};

const isValidDescription = (description: string | undefined): boolean => {
  return !!description && typeof description === 'string';
};

const areSectionsValid = (sections?: LernCoursePlanGenerationSection[]): boolean => {
  if (!sections) return false;

  return sections.every((section) => {
    return section.title
      && section.shortDescription
      && (section.order ?? -1) >= 0
      && (section.goals?.length ?? 0) > 0;
  });
};

export const normalizeSections = (sections?: LernCoursePlanGenerationSection[]): LernCoursePlanGenerationSection[] => {
	return (sections ?? []).map((section) => ({
		id: section.id ?? 'new',
    title: section.title,
    order: section.order,
    goals: section.goals,
    shortDescription: section.shortDescription,
  }));
};

const arePrerequisitesValid = (prerequisites?: string[]): boolean => {
  if (!prerequisites) return false;

  return prerequisites.every((prereq) => typeof prereq === 'string');
};
