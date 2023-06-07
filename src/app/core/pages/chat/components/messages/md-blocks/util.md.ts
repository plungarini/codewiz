export const unescapeAmp = (htmlStr: string) => {
	htmlStr = htmlStr.replace(/&amp;/g , "&");
	htmlStr = htmlStr.replace(/&#39;/g , "\'");
	return htmlStr;
}