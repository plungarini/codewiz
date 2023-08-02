import { paragraph } from './paragraph.md';

export const heading = (text: string, level: number) => {
	return paragraph(`<strong class="text-zinc-200">${text}</strong>`);
};
