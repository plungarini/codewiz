export const codespan = (code: string) => `
	<code class="hljs !bg-zinc-950 rounded-md selection:bg-sky-400/90 selection:text-sky-800 leading-5 my-[0.1rem] break-words whitespace-pre-wrap inline-flex max-w-full">${unescape(code)}</code>
`.trim();

const unescape = (htmlStr: string) => {
	htmlStr = htmlStr.replace(/&lt;/g , "<");	 
	htmlStr = htmlStr.replace(/&gt;/g , ">");     
	htmlStr = htmlStr.replace(/&quot;/g , "\"");  
	htmlStr = htmlStr.replace(/&#39;/g , "\'");   
	htmlStr = htmlStr.replace(/&amp;/g , "&");
	return htmlStr;
}