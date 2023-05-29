import { unescapeHtml } from './util.md';

export const codespan = (code: string) => `
	<code class="hljs !bg-zinc-950 rounded-md selection:bg-sky-400/90 selection:text-sky-800 leading-5 my-[0.1rem] break-words whitespace-pre-wrap inline-flex max-w-full">${unescapeHtml(code)}</code>
`.trim();