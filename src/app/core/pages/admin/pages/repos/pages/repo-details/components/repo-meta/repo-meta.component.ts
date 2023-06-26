import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectedDocs } from 'src/app/shared/models/select-docs.model';

@Component({
  selector: 'app-repo-meta',
  templateUrl: './repo-meta.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoMetaComponent {
	@Input('repo') set setRepo(value: SelectedDocs | undefined | null) {
		if (!value) return;
		this.form.patchValue(value);
		this.initReplaceStrings(value.replaceStrings);
		console.log(this.form.value);
	};

	private builder = new FormBuilder();

	form = this.builder.group({
		id: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		name: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		logo: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		url: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		hide: this.builder.control(false),
		hostUrl: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		replaceUrl: this.builder.control('', { nonNullable: true }),
		replaceStrings: this.builder.array<FormGroup<{ s: FormControl<string>, r: FormControl<string> }>>([]),
	});

	private initReplaceStrings(replaceStrings: { s: string, r: string }[]) {
		if (!replaceStrings || replaceStrings.length <= 0) return;
		
		this.form.controls.replaceStrings.reset();
		const replaceStringsArray = this.form.controls.replaceStrings;
		for (let i = 0; i < replaceStrings.length; i++) {
			const replacer = replaceStrings[i];
			const group = this.builder.group({
				s: this.builder.control(replacer.s, { nonNullable: true, validators: [Validators.required] }),
				r: this.builder.control(replacer.r, { nonNullable: true, validators: [Validators.required] }),
			})
			replaceStringsArray.push(group);
		}
	}
}
