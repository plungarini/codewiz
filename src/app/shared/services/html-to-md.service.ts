import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Converter } from 'showdown';

@Injectable({
  providedIn: 'root'
})
export class HtmlToMdService {

	private showdown = new Converter();

	constructor(
		private http: HttpClient,
		private functions: Functions,
	) { }

	async fetchPage(url: string): Promise<void> {
		const getSitemapLinks = httpsCallable<string, string>(this.functions, 'scrapePage', { timeout: 540 * 1000 });
		const { data } = await getSitemapLinks(url);
		console.log(data);
		
    /* const { window } = new JSDOM(html);
    return window.document; */
  }
	
	private parseHtml(html: string): string {
		return this.showdown.makeMarkdown(html);
	}
}
