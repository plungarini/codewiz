export const link = (href: string | null, title: string | null, text: string) => `
	<a href="${href}" title="${title || text}" target="_blank" class="text-indigo-600 decoration-solid font-medium decoration-1 underline visited:text-purple-600 visited:decoration-purple-400 decoration-indigo-400 text-sm md:text-base">${text}</a>
`.trim();