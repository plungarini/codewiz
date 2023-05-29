export const list = (body: string, ordered: boolean) => `
	<${ordered ? 'ol' : 'ul'} class="${ordered ? 'list-decimal' : 'list-disc'} list-inside first:mt-0 marker:text-zinc-400/50 my-4 space-y-2">
		${body}
	</${ordered ? 'ol' : 'ul'}>
`.trim();

export const listitem = (text: string) => `
	<li class="text-base text-zinc-400">${text.replace('mt-4 first-of-type:mt-0', 'inline-block')}</li>
`.trim();