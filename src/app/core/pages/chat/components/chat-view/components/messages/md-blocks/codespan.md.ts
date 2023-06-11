import { unescapeAmp } from './util.md';

export const codespan = (code: string, lang?: string) => `
	<code class="hljs ${lang ? `${lang} ` : ''}!bg-zinc-950 text-xs md:text-sm rounded-md selection:bg-sky-400/90 selection:text-sky-800 leading-5 my-[0.1rem] break-words whitespace-pre-wrap inline-flex max-w-full">` + unescapeAmp(code) + `</code>
`.trim();