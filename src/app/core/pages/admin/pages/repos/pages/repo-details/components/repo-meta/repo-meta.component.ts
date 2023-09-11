import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import _isEqual from 'lodash-es/isEqual';
import _uniqWith from 'lodash-es/uniqWith';
import { Repo } from '../../../../../../../../../shared/models/repo.model';
import { AdminRepoService } from '../../services/admin-repo.service';


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
	@Input('repo') set setRepo(value: Repo | undefined | null) {
		this.updateForm(value);
	};
	
	private builder = new FormBuilder();

	loadingSave = false;
	
	form = this.builder.group({
		id: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		name: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		logo: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		url: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		hide: this.builder.control(false),
		hostUrl: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		replaceUrl: this.builder.control('', { nonNullable: true }),
		replaceStrings: this.builder.array<FormGroup<{ s: FormControl<string>, r: FormControl<string> }>>([]),
		querySuggestions: this.builder.array<FormControl<string>>([]),
	}, { updateOn: 'blur' });

	constructor(
		private cdRef: ChangeDetectorRef,
		private adminRepo: AdminRepoService,
	) { }

	async save() {
		this.loadingSave = true;
		this.cdRef.markForCheck();

		const formValue = this.form.value;
		const newReplaceStrings = _uniqWith(
			formValue.replaceStrings?.map((r) => ({
				s: r.s || '', r: r.r || '',
			})) || [],
			_isEqual
		);
		const value: Partial<Repo> = {
			id: formValue.id,
			name: formValue.name,
			logo: formValue.logo,
			url: formValue.url,
			hide: !!formValue.hide,
			hostUrl: formValue.hostUrl,
			replaceUrl: formValue.replaceUrl,
			replaceStrings: newReplaceStrings,
			querySuggestions: formValue.querySuggestions,
		};

		try {
			await this.adminRepo.updateRepo(value);
		} catch (err) {
			console.error(err);
		}
		this.loadingSave = false;
		this.cdRef.markForCheck();
	}

	private updateForm(value?: Partial<Repo> | null): void {
		if (!value) return;
		this.form.reset(undefined, { emitEvent: false });
		this.form.patchValue(value);
		this.initReplaceStrings(value.replaceStrings || []);
	}

	private initReplaceStrings(replaceStrings: { s: string, r: string }[]) {
		if (!replaceStrings || replaceStrings.length <= 0) return;
		const normStrings = _uniqWith(replaceStrings || [], _isEqual);
		
		this.form.controls.replaceStrings = this.builder.array<FormGroup<{ s: FormControl<string>, r: FormControl<string> }>>([]);
		const replaceStringsArray = this.form.controls.replaceStrings;
		for (let i = 0; i < normStrings.length; i++) {
			const replacer = normStrings[i];
			const group = this.builder.group({
				s: this.builder.control(replacer.s, { nonNullable: true, validators: [Validators.required] }),
				r: this.builder.control(replacer.r, { nonNullable: true, validators: [Validators.required] }),
			})
			replaceStringsArray.push(group);
		}
	}
}
