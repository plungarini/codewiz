export type Embedding = {
	createdAt: string;
	id: string;
	path: string;
	section: number;
	title: string;
	token_count: number;
	updatedAt: string;
}
export type FetchPageData = {
  page_link: string;
  body_selector: string;
  excluded_selectors: string[];
};

export type GenerateEmbeddingData = {
	author: string
  title: string;
  link: string;
  content: string;
  id: string;
};

export type FetchGitRepoData = {
	author: string;
	folder: string;
	relativeLinksHost: string;
}

export type FetchGitRepoRes = {
	name: string;
	content: string;
	title: string;
	path: string;
}