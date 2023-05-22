import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HtmlToMdService } from './shared/services/html-to-md.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  result: string = '';
  buttonLoading: boolean = false;
  buttonLoadingEmbeddings: boolean = false;
  scrapeUrlform = new FormGroup({
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    url: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    page_title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
	});
	
  scrapeRepoform = new FormGroup({
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    folder: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
	});
	
	repoFiles: {
		name: string;
		title: string;
		content: string;
		path: string;
		status?: 'loading' | 'success' | 'failed';
	}[] = [
		{ name: 'asd.md', title: 'Asd how to hello world', content: 'Asd how to hello world', status: 'loading', path: 'asd/asd' }
	];

  constructor(
    private htmlToMd: HtmlToMdService,
    private cdRef: ChangeDetectorRef
	) { }
	
	getExpectedSections(chars: number): number {
		const MAX_CHARS = 20_000;
		return Math.ceil(chars / MAX_CHARS);
	}

  async loadEmbeddings(): Promise<void> {
    this.buttonLoadingEmbeddings = true;
		try {
			const url = this.scrapeUrlform.controls.url.value;
			const normUrl = url
				.replace('http://', '')
				.replace('https://', '');
			const urlSections = normUrl.split('/');
			const id = `${urlSections[0]}/${urlSections[urlSections.length - 1]}`;
			const author = 'angular/angular';

			await this.htmlToMd.generateEmbedding({
				author,
        content: this.result,
        id,
        link: url,
        title: this.scrapeUrlform.controls.page_title.value,
      });
    } catch (error) {
      this.buttonLoading = false;
      console.error(error);
    }
    this.buttonLoadingEmbeddings = false;
	}
	
	async fetchRepo(): Promise<void> {
		if (!this.scrapeRepoform.value.author || !this.scrapeRepoform.value.folder) return console.error('All fields required');
		const cacheFiles = localStorage.getItem('repoFiles');

		if (!!cacheFiles) {
			const parsedCacheFiles = JSON.parse(cacheFiles);
			if (parsedCacheFiles.length > 0) {
				this.repoFiles = parsedCacheFiles;
				console.log('Loaded from cache.');
				this.parseRepoFiles();
				return;
			}
		}

		this.buttonLoading = true;
		this.repoFiles = [];
		this.result = '';
		try {
			this.repoFiles = await this.htmlToMd.fetchGitRepo({
				author: this.scrapeRepoform.value.author,
				folder: this.scrapeRepoform.value.folder,
			});
			localStorage.setItem('repoFiles', JSON.stringify(this.repoFiles));
			this.cdRef.detectChanges();
			this.buttonLoading = false;
			this.parseRepoFiles();
    } catch (error) {
      this.buttonLoading = false;
      console.error(error);
    }
	}

	async parseRepoFiles() {
		const author = this.scrapeRepoform.value.author;
		const folder = this.scrapeRepoform.value.folder;
		if (!author || !folder) return console.error('Author field is required');

		for (let i = 0; i < this.repoFiles.length; i++) {
			const file = this.repoFiles[i];
			if (file.status && file.status === 'success') continue;
			file.status = 'loading';
			this.cdRef.detectChanges();
			const id = `${author}/${folder}/${file.name
				.replace('.md', '')
				.replaceAll(' ', '_')
				.toLowerCase()}`;
			try {
				await this.htmlToMd.generateEmbedding({
					author: author,
					content: file.content,
					link: file.path,
					title: file.title,
					id
				});
				file.status = 'success';
				this.cdRef.detectChanges();
			} catch (error) {
				file.status = 'failed';
				this.cdRef.detectChanges();
				console.error(error);
				continue;
			}
		}

		const success = this.repoFiles.filter((f) => f.status === 'success').length;
		const failed = this.repoFiles.filter((f) => f.status === 'failed');

		localStorage.removeItem('repoFiles');
		if (failed.length > 0) {
			localStorage.setItem('repoFiles', JSON.stringify(failed))
		};

		console.log(`✨ Finished - ${success}/${failed.length} - Saved to local storage`)
	}

  async parse(): Promise<void> {
    if (!this.scrapeUrlform.value.category || !this.scrapeUrlform.value.url) return console.error('All fields required');

		this.buttonLoading = true;
		this.repoFiles = [];
		this.result = '';
    try {
      const parsed = await this.htmlToMd.fetchPage({
        page_link: this.scrapeUrlform.value.url,
        body_selector: 'body mat-sidenav-content section main',
        excluded_selectors: [],
      });
      this.result = parsed.markdown;
      this.scrapeUrlform.controls.page_title.setValue(parsed.page_title);

      console.log(parsed);
    } catch (error) {
      this.buttonLoading = false;
      console.error(error);
    }

    this.cdRef.detectChanges();
    this.buttonLoading = false;
	}
}
