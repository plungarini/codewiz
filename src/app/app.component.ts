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
  form = new FormGroup({
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

  constructor(
    private htmlToMd: HtmlToMdService,
    private cdRef: ChangeDetectorRef
  ) {}

  async loadEmbeddings(): Promise<void> {
    this.buttonLoadingEmbeddings = true;
    try {
      await this.htmlToMd.generateEmbedding({
        content: this.result,
        id: this.form.controls.url.value,
        link: this.form.controls.url.value,
        title: this.form.controls.page_title.value,
      });
    } catch (error) {
      this.buttonLoading = false;
      console.error(error);
    }
    this.buttonLoadingEmbeddings = false;
  }

  async parse(): Promise<void> {
    if (!this.form.value.category || !this.form.value.url) return;

    this.buttonLoading = true;
    try {
      const parsed = await this.htmlToMd.fetchPage({
        page_link: this.form.value.url,
        body_selector: 'body',
        excluded_selectors: ['footer'],
      });
      this.result = parsed.markdown;
      this.form.controls.page_title.setValue(parsed.page_title);

      console.log(parsed);
    } catch (error) {
      this.buttonLoading = false;
      console.error(error);
    }

    this.cdRef.detectChanges();
    this.buttonLoading = false;
  }
}
