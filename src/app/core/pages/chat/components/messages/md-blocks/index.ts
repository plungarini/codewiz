import { blockquote } from './blockquote.md';
import { checkbox } from './checkbox.md';
import { codeBlockAndHeader, codeBlockPlain } from './code-block.md';
import { codespan } from './codespan.md';
import { heading } from './heading.md';
import { hr } from './hr.md';
import { image } from './image.md';
import { link } from './link.md';
import { list, listitem } from './list.md';
import { paragraph } from './paragraph.md';
import { table, tablecell, tablerow } from './table.md';

import hljs from 'highlight.js';
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

// function that returns `MarkedOptions` with renderer override
export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.code = (code, lang, isEscaped) => {
		const highlighted = hljs.highlightAuto(code, lang ? [lang] : []).value;
		if (!lang) {
			return codeBlockPlain(highlighted);
		}
		return codeBlockAndHeader(lang, highlighted);
	}
	renderer.codespan = (code) => {
		const highlighted = hljs.highlightAuto(code).value;
		return codespan(highlighted);
	}
	renderer.paragraph = (text) => {
		return paragraph(text);
	}
	renderer.blockquote = (quote) => {
		return blockquote(quote);
	}
	renderer.checkbox = (checked) => {
		return checkbox(checked);
	}
	renderer.heading = (text, level) => {
		return heading(text, level);
	}
	renderer.hr = () => {
		return hr();
	}
	renderer.image = (href, title, text) => {
		return image(href, title, text);
	}
	renderer.link = (href, title, text) => {
		return link(href, title, text);
	}
	renderer.list = (body, ordered) => {
		return list(body, ordered);
	}
	renderer.listitem = (text) => {
		return listitem(text);
	}

	renderer.table = (header, body) => {
		return table(header, body);
	}

	renderer.tablecell = (content, flags) => {
		return tablecell(content, flags);
	}
	renderer.tablerow = (content) => {
		return tablerow(content);
	}

  return {
    renderer: renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  };
}
