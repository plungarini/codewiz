import { paragraph } from './paragraph.md';

export const heading = (text: string, level: number) => {
	return level <= 3 ? `<h${level} class="mb-2 mt-4">${text}</h${level}>` : paragraph(`<strong class="text-zinc-200">${text}</strong>`);
};
