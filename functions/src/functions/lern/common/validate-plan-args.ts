import { warn } from 'firebase-functions/logger';
import * as json5 from 'json5';
import { LernCoursePlanGeneration, LernCoursePlanGenerationSection } from '../models/lern.model';

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

  const normArgs = typeof args === 'string' ? parseArgs(args) : args;
	if (!normArgs) {
		warn('Unable to parse JSON', 'HALLUCINATING');
		return undefined;
	}

	if (!isValidCourseName(normArgs.courseName)) {
		warn('Invalid course name', 'HALLUCINATING');
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
    sections: normalizeSections(normArgs.sections),
    prerequisites: normArgs.prerequisites,
  };
};

const parseArgs = (args: string): LernCoursePlanGeneration | undefined => {
	// Regular expression to remove trailing commas
	const regex = /,\s*([\]}])/gm;

	// Regular expression to remove double commas (,,)
	const doubleCommaRegex = /,\s*(,)/gm;

	// Remove trailing commas and try to parse
	const sanitizedData = args.replace(regex, '$1').replace(doubleCommaRegex, '$1');

  try {
    return json5.parse(sanitizedData);
  } catch (err) {
    return undefined;
  }
};

const isValidCourseName = (courseName: string | undefined): boolean => {
  return !!courseName && typeof courseName === 'string';
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
