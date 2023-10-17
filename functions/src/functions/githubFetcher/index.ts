import { Axios } from 'axios';
import { error, warn } from 'firebase-functions/logger';

type TreeFile = {
	path: string;
	type: 'blob' | 'tree';
	sha: string;
	url: string;
}

const isFulfilled = <T, >(p:PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';
const isRejected = <T, >(p:PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

const axios = new Axios({
	headers: {
		Accept: 'application/json',
		Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
	},
});

const SUPPORTED_EXTS = ['.md', '.markdown', '.rst', '.mdx'];

/* const getLastModifiedFile = async (author: string, path: string) => {
	const encodedPath = encodeURIComponent(path);
	try {
		const { data } = await axios.get(`https://api.github.com/repos/${author}/commits?path=${encodedPath}&page=1&per_page=1`);
		if (!data) throw new Error('Unable to retrieve file for last-modified');
		const normFile = JSON.parse(data);
		if (normFile?.at(0)) throw new Error('Unable to parse file for last-modified');
		const date = normFile[0].commit?.committer?.date as string | undefined;
		return date || '';
	} catch (err) {
		error(err);
		throw err;
	}
}; */

const getRecentCommitTree = async (author: string): Promise<string | undefined> => {
	try {
		const { data: commits } = await axios.get(`https://api.github.com/repos/${author}/commits`);

		if (!commits) throw new Error('Unable to retrieve commits');
		const normCommits = JSON.parse(commits);
		if (!normCommits) throw new Error('Unable to parse commits');

		if (normCommits.length <= 0 || !normCommits[0]) throw new Error('Unable to parse commits');

		const tree = normCommits[0].commit?.tree?.url;
		return tree;
	} catch (err) {
		error(err);
		throw err;
	}
};

const getTreeFiles = async (treeUrl: string, filter: 'tree' | 'blob'): Promise<TreeFile[]> => {
	try {
		const { data: files } = await axios.get(treeUrl);

		if (!files) throw new Error('Unable to retrieve tree files');
		const normFiles = JSON.parse(files);
		if (normFiles?.tree.length <= 0) throw new Error('Unable to parse tree files');

		const tree = normFiles.tree as TreeFile[];
		return tree ? tree.filter((file) => file.type === filter) : [];
	} catch (err) {
		error(err);
		throw err;
	}
};

const elaborateTitle = (input: string, fileName: string): string => {
	// Markdown #
	const markdownRegex = /#\s([^\n]+)/;

	// Front Matter in Markdown
	const frontMatterRegex = /-{3,}\ntitle:\s*([^\n]+)/;

	// reStructuredText
	const reSTRegex = /={3,}\n(.+)\n={3,}/;

	// reStructuredText 2
	const reSTRegex2 = /\*{3,}\n(.+)\n\*{3,}/;

	// HTML
	const htmlRegex = /<h1>(.*?)<\/h1>/;

	// Try to match the input with each of the regex patterns
	const markdownMatch = markdownRegex.exec(input);
	const frontMatterMatch = frontMatterRegex.exec(input);
	const reSTMatch = reSTRegex.exec(input);
	const reST2Match = reSTRegex2.exec(input);
	const htmlMatch = htmlRegex.exec(input);

	const titles = [];

	if (markdownMatch?.at(1)) {
		titles.push({ title: markdownMatch[1], index: markdownMatch.index });
	}
	if (frontMatterMatch?.at(1)) {
		titles.push({ title: frontMatterMatch[1], index: frontMatterMatch.index });
	}
	if (reSTMatch?.at(1)) {
		titles.push({ title: reSTMatch[1], index: reSTMatch.index });
	}
	if (reST2Match?.at(1)) {
		titles.push({ title: reST2Match[1], index: reST2Match.index });
	}
	if (htmlMatch?.at(1)) {
		titles.push({ title: htmlMatch[1], index: htmlMatch.index });
	}

	// Sort titles by index
	titles.sort((a, b) => a.index - b.index);

	// Use the first title (with the lowest index) or fallback to file name processing
	const title = titles.length > 0 ? titles[0].title : (() => {
		const normTitle = fileName.replace(/[-_]/g, ' ');
		let fallbackTitle = normTitle[0].toUpperCase() + normTitle.substring(1);
		for (const ext of SUPPORTED_EXTS) {
			fallbackTitle = fallbackTitle.replace(ext, '');
		}
		return fallbackTitle;
	})();

	return title;
};


const getMarkdown = async (fileUrl: string, fileName: string, host: string): Promise<{ name: string, content: string, title: string, path: string }> => {
	try {
		const { data: file } = await axios.get(fileUrl);
		warn('Downloading file ' + fileName);

		if (!file) throw new Error('Unable to retrieve markdown file.');
		const normFile = JSON.parse(file);
		if (!normFile?.content) throw new Error('Unable to parse markdown file because content is undefined.');

		const buff = Buffer.from(normFile.content, 'base64');
		let decoded = buff.toString('utf8');
		if (!decoded) throw new Error('Unable to parse markdown file, decoded value is undefined.');

		const title = elaborateTitle(decoded, fileName);

		// Regular expression to match relative links
    const relativeLinkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g;
    // Replace relative links with absolute links
		decoded = decoded.replace(relativeLinkRegex, `[$1](${host}/$2)`);

		return {
			name: fileName,
			content: decoded,
			path: fileUrl,
			title,
		};
	} catch (err) {
		error(err);
		throw err;
	}
};

const checkApiLimit = async () => {
	try {
		const response = await axios.get('https://api.github.com/users/octocat');

		const limit = parseInt(response.headers['x-ratelimit-limit']);
		const remaining = parseInt(response.headers['x-ratelimit-remaining']);
		const reset = parseInt(response.headers['x-ratelimit-reset']);

		if (Number.isNaN(limit) || Number.isNaN(remaining) || Number.isNaN(reset)) {
			// Invalid headers, unable to determine rate limit
			return -1;
		}

		const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
			const remainingTime = Math.max(reset - currentTime, 0); // Remaining time in seconds

			const remainingMinutes = Math.ceil(remainingTime / 60); // Remaining time in minutes


			return `${remaining}/${limit} - Remaining time: ${remainingMinutes} mins`;
	} catch (err) {
		error(err);
		throw err;
	}
};

export const githubFolderFetcher = async (req: {
	author: string;
	folder: string;
	relativeLinksHost: string;
}) => {
	const requestsLimit = await checkApiLimit();
	warn(requestsLimit);
	warn('Request', req);

	const author = req.author.replace(/^\/|\/$/g, '');
	const folder = req.folder.replace(/^\/|\/$/g, '');
	const paths = folder.split('/');

	try {
		const tree = await getRecentCommitTree(author);
		if (!tree) throw new Error('Unable to get recent commit tree.');

		let treeFiles = await getTreeFiles(tree, 'tree');

		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];
			const file = treeFiles.find((file) => file.path === path);
			if (!file) throw new Error('Check that folder path is correct.');
			treeFiles = await getTreeFiles(
				file.url,
				i === (paths.length - 1) ? 'blob' : 'tree' // If last folder, filter for files.
			);
		}

		const promises: Promise<{ name: string, content: string, title: string, path: string }>[] = [];

		for (const element of treeFiles) {
			const file = element;
			const hasSupportedExtension = SUPPORTED_EXTS.some((ext) => file?.path?.includes(ext));
			if (!file?.url || !hasSupportedExtension) continue;
			promises.push(getMarkdown(file.url, file.path, req.relativeLinksHost));
		}

		const results = await Promise.allSettled(promises);
		const values = results.filter(isFulfilled).map((res) => res.value);
		const rejected = results.filter(isRejected).map((res) => res.reason);
		warn(`${values.length} requests succeded.`, values);
		if (rejected.length > 0) error(`${rejected.length} requests failed.`, rejected);
		return values;
	} catch (err) {
		error(err);
		throw err;
	}
};
