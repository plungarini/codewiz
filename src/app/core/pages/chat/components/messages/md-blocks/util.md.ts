export const unescapeAmp = (htmlStr: string) => {
	htmlStr = htmlStr.replace(/&amp;/g , "&");
	return htmlStr;
}