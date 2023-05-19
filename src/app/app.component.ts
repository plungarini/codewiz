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

  constructor(
    private htmlToMd: HtmlToMdService,
    private cdRef: ChangeDetectorRef
  ) {}

  async loadEmbeddings(): Promise<void> {
    this.buttonLoadingEmbeddings = true;
		try {
			const url = this.scrapeUrlform.controls.url.value;
			const normUrl = url
				.replace('http://', '')
				.replace('https://', '');
			const urlSections = normUrl.split('/');
			const id = `${urlSections[0]}/${urlSections[urlSections.length - 1]}`;

      await this.htmlToMd.generateEmbedding({
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

		this.buttonLoading = true;
		try {
      await this.htmlToMd.fetchGitRepo();
    } catch (error) {
      this.buttonLoading = false;
      console.error(error);
    }

    this.cdRef.detectChanges();
    this.buttonLoading = false;
	}

  async parse(): Promise<void> {
    if (!this.scrapeUrlform.value.category || !this.scrapeUrlform.value.url) return console.error('All fields required');

    this.buttonLoading = true;
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
