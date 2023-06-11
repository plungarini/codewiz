import { unescapeAmp } from './util.md';

export const codespan = (code: string, lang?: string) => `
	<code class="hljs ${lang ? `${lang} ` : ''}!bg-zinc-950 rounded-md selection:bg-sky-400/90 selection:text-sky-800 leading-5 my-[0.1rem] break-words whitespace-pre-wrap text-sm inline-flex max-w-full">` + unescapeAmp(code) + `</code>
`.trim();