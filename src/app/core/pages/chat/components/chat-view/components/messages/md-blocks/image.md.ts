import { paragraph } from './paragraph.md'

export const image = (href: string | null, title: string | null, text: string) => {
	return `<div class="w-fit"><img src="${href}" alt="${title}" title="${title}" class="max-h-48 rounded-md mx-auto"></img>` + (
		text ? paragraph(`<span class="text-xs text-center w-full inline-block max-w-prose mx-auto">${text}</span>`) : ''
	) + `</div>`
}