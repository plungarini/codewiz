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
	baseURL: 'https://api.github.com/repos/',
	headers: { Accept: 'application/json' },
});

const getRecentCommitTree = async (author: string): Promise<string | undefined> => {
	const { data: commits } = await axios.get(`${author}/commits`);

	if (!commits) throw new Error('Unable to retrieve commits');
	const normCommits = JSON.parse(commits);
	if (!normCommits) throw new Error('Unable to parse commits');

	if (normCommits.length <= 0 || !normCommits[0]) throw new Error('Unable to parse commits');

	const tree = normCommits[0].commit?.tree?.url;
	warn('Tree', tree);
	return tree;
};

const getTreeFiles = async (treeUrl: string): Promise<TreeFile[]> => {
	const { data: files } = await axios.get(treeUrl);

	if (!files) throw new Error('Unable to retrieve tree files');
	const normFiles = JSON.parse(files);
	if (normFiles?.tree.length <= 0) throw new Error('Unable to parse tree files');

	const tree = normFiles.tree as TreeFile[];
	warn('Tree files', tree);
	return tree ? tree.filter((file) => file.type === 'tree') : [];
};

const getMarkdown = async (fileUrl: string): Promise<{ name: string, content: string }> => {
	const { data: file } = await axios.get(fileUrl);
	const fileName = fileUrl.split('/').pop();

	if (!fileName) throw new Error(`Canot find file name for url ${fileUrl}`);
	if (!file) throw new Error('Unable to retrieve markdown file');
	const normFile = JSON.parse(file);
	if (normFile?.content) throw new Error('Unable to parse markdown file');

	const buff = Buffer.from(normFile.content, 'base64');
	const decoded = buff.toString('utf8');
	if (decoded) throw new Error('Unable to parse markdown file');
	return { name: fileName, content: decoded };
};


export const githubFolderFetcher = async () => {
	const author = 'angular/angular';
	const folder = 'aio/content/guide';
	const paths = folder.split('/');

	try {
		const tree = await getRecentCommitTree(author);
		if (!tree) throw new Error('Unable to get recent commit tree.');

		let treeFiles = await getTreeFiles(tree);

		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];
			const file = treeFiles.find((file) => file.path === path);
			if (!file) throw new Error('Check that folder path is correct.');
			treeFiles = await getTreeFiles(file.url);
		}

		const promises: Promise<{ name: string, content: string }>[] = [];

		for (let i = 0; i < treeFiles.length; i++) {
			const file = treeFiles[i];

			// TODO: Remove this. Only for test purposes.
			if (i > 4) break;

			if (!file || !file.url) continue;
			promises.push(getMarkdown(file.url));
		}

		const results = await Promise.allSettled(promises);
		const values = results.filter(isFulfilled).map((res) => res.value);
		const rejected = results.filter(isRejected).map((res) => res.reason);
		warn(values);
		error(`${rejected.length} requests failed.`, rejected);
		return values;
	} catch (err) {
		error(err);
		throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
	}
};
