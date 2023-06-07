import { unescapeAmp } from './util.md';

export const codeBlockAndHeader = (lang: string, code: string) => `
	<div class="w-full my-3 relative group">
		<div class="w-full px-2.5 py-2 bg-zinc-700 rounded-t-lg">
			<p class="text-zinc-300 -mt-[0.2rem] text-sm">${lang || 'Code Snippet'}</p>
		</div>
		<pre class="whitespace-pre overflow-x-auto max-w-full"><code class="hljs ${lang ? `${lang} ` : ''}!bg-zinc-950 rounded-b-lg break-words min-w-full flex w-full selection:bg-sky-900/90 selection:text-sky-400 max-w-full">` + unescapeAmp(code) + `</code></pre>
	</div>
`.trim();

export const codeBlockPlain = (code: string) => `
	<div class="w-full my-3 relative group">
		<pre class="max-w-full overflow-x-auto"><code class="hljs !bg-zinc-950 rounded-lg break-words min-w-full whitespace-pre-wrap flex w-full max-w-full">` + unescapeAmp(code) + `</code></pre>
	</div>
`.trim();
