import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable, Subscription, take } from 'rxjs';
import { UserRepoService } from 'src/app/core/pages/chat/services/user-repo.service';
import { Repo, RepoPage } from '../../../../../../../../../shared/models/repo.model';
import { AdminRepoService } from '../../services/admin-repo.service';
import { EmbeddingsService } from '../../services/embeddings.service';

type HistoryProps = 'author' | 'folder' | 'relativeLinksHost';

@Component({
  templateUrl: './edit-pages.component.html',
  styles: [
    `
      :host {
        @apply block h-full relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPagesComponent implements OnDestroy {

	repoId: string;
	repo: Repo | undefined;

	buttonLoading: boolean = false;
	buttonLoadingEmbeddings: boolean = false;

	repoHistory: Repo['editPagesSearch'];
	repoHistorySub: Subscription;
	showHistory = {
		author: false,
		folder: false,
		relativeLinksHost: false,
	};

	autoParse = this.fb.control(false);
	showPreviewContent = '';

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

	constructor(
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private cdRef: ChangeDetectorRef,
		private repoService: UserRepoService,
		private embeddingsService: EmbeddingsService,
		private adminRepoService: AdminRepoService,
	) { 
		this.repoId = this.route.snapshot.params['id'];
		this.repoService.getRepo(this.repoId).pipe(take(1)).subscribe((repo) => {
			this.repo = repo;
		});

		this.repoHistorySub = this.adminRepoService.getEditPagesSearch(this.repoId).subscribe((repoHistory) => {
			this.repoHistory = repoHistory;
			this.cdRef.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.repoHistorySub.unsubscribe();
	}

	showHistoryFn(id: HistoryProps, value: boolean): void {
		setTimeout(() => {
			this.showHistory[id] = value;
			this.cdRef.markForCheck();
		}, 100);
	}
	
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

	async removeRecentSearch(id: HistoryProps, value: string): Promise<void> {
		await this.adminRepoService.removeEditPagesSearch(this.repoId, { [id]: [value] });
	}

	onPreviewContent(content: string): void {
		if (!content) return;
		this.showPreviewContent = content;
		this.cdRef.markForCheck();
	}

	setValueFromHistorySearch(id: HistoryProps, value: string): void {
		this.scrapeRepoform.patchValue({ [id]: value });
		this.cdRef.markForCheck();
	}
	
	async fetchRepo(): Promise<void> {
		if (!this.scrapeRepoform.valid)
			return console.error('All fields required');

		this.buttonLoading = true;
		this.showPreviewContent = '';
		this._pages$.next([]);
		this.cdRef.markForCheck();
		try {
			const files = await this.embeddingsService.fetchGitRepo({
				author: this.scrapeRepoform.value.author ?? '',
				folder: this.scrapeRepoform.value.folder ?? '',
				relativeLinksHost: this.scrapeRepoform.value.relativeLinksHost ?? '',
			});
			this._pages$.next(files);
			console.log({ files })
			this.buttonLoading = false;
			this.buttonLoadingEmbeddings = false;
			this.cdRef.markForCheck();

			const req: Partial<Repo['editPagesSearch']> = {};
			if (this.scrapeRepoform.value.author) req.author = [this.scrapeRepoform.value.author];
			if (this.scrapeRepoform.value.folder) req.folder = [this.scrapeRepoform.value.folder];
			if (this.scrapeRepoform.value.relativeLinksHost) req.relativeLinksHost = [this.scrapeRepoform.value.relativeLinksHost];

			if (files.length > 0)
				await this.adminRepoService.updateEditPagesSearch(this.repoId, req);
			
			this.parseRepoFiles();
    } catch (error) {
			this.buttonLoading = false;
			this.buttonLoadingEmbeddings = false;
			this.cdRef.markForCheck();
      console.error(error);
    }
	}

	async parseRepoFiles(run = this.autoParse.value) {
		if (!run) return;

		if (!this.scrapeRepoform.valid) {
			return console.error('Form is invalid.');
		}

		this.buttonLoadingEmbeddings = true;
		this.cdRef.markForCheck();

		let files = await firstValueFrom(this.pages$);

		for (const file of files) {
			try {
				await this.parseRepoFile(file, files);
			} catch (err) {
				continue;
			}
		}

		files = await firstValueFrom(this.pages$);

		const success = files.filter(f => f.status === 'success').length;
		const failed = files.filter(f => f.status === 'failed');

		console.log(`✨ Finished - ${success}/${failed.length}`);
		this.buttonLoadingEmbeddings = false;
		this.cdRef.markForCheck();
	}

	async parseRepoFile(inputFile: RepoPage, inputFiles?: RepoPage[]): Promise<void> {
		if (inputFile.status && inputFile.status === 'success') {
			return;
		}

		if (!this.repoId) {
			return console.error('Repo not found, id must be provided');
		}

		const files: RepoPage[] = inputFiles ?? await firstValueFrom(this.pages$);
		const file = files.find(f => f.name === inputFile.name);
		const author = this.scrapeRepoform.value.author;
		const folder = this.scrapeRepoform.value.folder;

		if (!file) return console.warn('Unable to find file => ', inputFile);

		file.status = 'loading';
		this._pages$.next(files);

		const id = `${author}/${folder}/${file.name.replace('.md', '').replaceAll(' ', '_').toLowerCase()}`;

		try {
			await this.embeddingsService.generateEmbedding({
				author: author ?? '',
				table: this.repo?.tableName ?? this.repoId,
				content: file.content,
				link: file.path,
				title: file.title,
				id
			});

			file.status = 'success';
			this._pages$.next(files);

			this.adminRepoService.updateRepoTimestamp(this.repoId);
		} catch (error) {
			file.status = 'failed';
			this._pages$.next(files);
			console.error(error);
		}
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

    this.cdRef.markForCheck();
    this.buttonLoading = false;
	} */

}
