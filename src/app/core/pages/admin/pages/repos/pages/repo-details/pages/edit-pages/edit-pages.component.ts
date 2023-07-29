import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { RepoPage } from '../../../../../../../../../shared/models/repo.model';
import { EmbeddingsService } from '../../services/embeddings.service';

@Component({
  templateUrl: './edit-pages.component.html',
  styles: [
    `
      :host {
        @apply block h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPagesComponent {

	repoId: string;

	constructor(
		private route: ActivatedRoute,
		private embeddingsService: EmbeddingsService,
		private cdRef: ChangeDetectorRef,
		private fb: FormBuilder,
	) { 
		this.repoId = this.route.snapshot.params['id'];
	}

  buttonLoading: boolean = false;
	buttonLoadingEmbeddings: boolean = false;

	autoParse = this.fb.control(false);
	
  /* scrapeUrlform = new FormGroup({
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
	}); */
	
	scrapeRepoform = this.fb.group({
		author: ['', {
			nonNullable: true,
			validators: [Validators.required],
		}],
		folder: ['', {
			nonNullable: true,
			validators: [Validators.required],
		}],
		relativeLinksHost: ['', {
			nonNullable: true,
			validators: [Validators.required],
		}],
	});

	private _pages$ = new BehaviorSubject<RepoPage[]>([]);
	pages$: Observable<RepoPage[]> = this._pages$.asObservable();

  /* async loadEmbeddings(): Promise<void> {
    this.buttonLoadingEmbeddings = true;
		try {
			const url = this.scrapeUrlform.controls.url.value;
			const normUrl = url
				.replace('http://', '')
				.replace('https://', '');
			const urlSections = normUrl.split('/');
			const id = `${urlSections[0]}/${urlSections[urlSections.length - 1]}`;
			const author = 'angular/angular';

			await this.embeddingsService.generateEmbedding({
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
	} */
	
	async fetchRepo(): Promise<void> {
		if (!this.scrapeRepoform.valid)
			return console.error('All fields required');

		this.buttonLoading = true;
		this.cdRef.detectChanges();
		try {
			const files = await this.embeddingsService.fetchGitRepo({
				author: this.scrapeRepoform.value.author || '',
				folder: this.scrapeRepoform.value.folder || '',
				relativeLinksHost: this.scrapeRepoform.value.relativeLinksHost || '',
			});
			this._pages$.next(files);
			this.buttonLoading = false;
			this.buttonLoadingEmbeddings = false;
			this.cdRef.detectChanges();
			this.parseRepoFiles();
    } catch (error) {
			this.buttonLoading = false;
			this.buttonLoadingEmbeddings = false;
			this.cdRef.detectChanges();
      console.error(error);
    }
	}

	async parseRepoFiles(run = this.autoParse.value) {
		if (!run) return;
		
		const author = this.scrapeRepoform.value.author;
		const folder = this.scrapeRepoform.value.folder;

		if (!this.scrapeRepoform.valid) {
			return console.error('Form is invalid.');
		}

		this.buttonLoadingEmbeddings = true;
		this.cdRef.detectChanges();

		const files = await firstValueFrom(this.pages$);

		for (const file of files) {
			if (file.status && file.status === 'success') {
				continue;
			}

			file.status = 'loading';
			this._pages$.next(files);

			const id = `${author}/${folder}/${file.name.replace('.md', '').replaceAll(' ', '_').toLowerCase()}`;

			try {
				await this.embeddingsService.generateEmbedding({
					author: author || '',
					content: file.content,
					link: file.path,
					title: file.title,
					id
				});

				file.status = 'success';
				this._pages$.next(files);
			} catch (error) {
				file.status = 'failed';
				this._pages$.next(files);
				console.error(error);
				continue;
			}
		}

		const success = files.filter(f => f.status === 'success').length;
		const failed = files.filter(f => f.status === 'failed');

		console.log(`✨ Finished - ${success}/${failed.length} - Saved to local storage`);
		this.buttonLoadingEmbeddings = false;
		this.cdRef.detectChanges();
	}

	// Parse from url
  /* async parse(): Promise<void> {
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
	} */

}
