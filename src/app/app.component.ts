import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HtmlToMdService } from './shared/services/html-to-md.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
	form = new FormGroup({
		category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		url: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
	});
	
	constructor(
		private htmlToMd: HtmlToMdService,
	) { }

	async parse(): Promise<void> {
		if (!this.form.value.category || !this.form.value.url) return;


		const parsed = await this.htmlToMd.fetchPage(this.form.value.url);
		console.log(parsed)
		
	}
}
