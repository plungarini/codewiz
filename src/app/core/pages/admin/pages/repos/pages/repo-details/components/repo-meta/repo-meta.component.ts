import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
		tableName: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		category: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		name: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		logo: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		url: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		hostUrl: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		replaceUrl: this.builder.control('', { nonNullable: true }),
		replaceStrings: this.builder.array<FormGroup<{ s: FormControl<string>, r: FormControl<string> }>>([]),
		querySuggestions: this.builder.array<FormControl<string>>([]),
		visibility: this.builder.control<'public' | 'restricted'>('restricted', { nonNullable: true, validators: [Validators.required] }),
	});
	dbRepo: Partial<Repo> | undefined;

	visibilityRolesForm = this.builder.group({
		control: this.builder.control('', { nonNullable: true, validators: Validators.required }),
	});

	visibilityRoles: Set<string> = new Set(['admin']);

	constructor(
		private cdRef: ChangeDetectorRef,
		private adminRepo: AdminRepoService,
		private router: Router,
	) { }

	async save() {
		this.loadingSave = true;
		this.cdRef.markForCheck();

		const formValue = this.form.value;
		const normQuerySuggestions =
			this.form.controls.querySuggestions.controls.map((s) => s.value)
			.slice(0, 4);
		const normReplaceStrings = this.form.controls.replaceStrings.controls.map((s) => s.value);
		const newReplaceStrings = _uniqWith(
			normReplaceStrings?.map((r) => ({
				s: r.s ?? '', r: r.r ?? '',
			})) ?? [],
			_isEqual
		);

		const normVisibility = formValue.visibility === 'restricted' && this.visibilityRoles.size <= 0 ? 'public' : formValue.visibility;
		const normVisibilityRoles = normVisibility === 'public' ? [] : [...this.visibilityRoles];

		const value: Partial<Repo> = {
			id: formValue.id,
			tableName: formValue.tableName,
			name: formValue.name,
			logo: formValue.logo,
			url: formValue.url,
			hostUrl: formValue.hostUrl,
			replaceUrl: formValue.replaceUrl,
			replaceStrings: newReplaceStrings,
			querySuggestions: normQuerySuggestions,
			category: formValue.category,
			visibility: normVisibility,
			visibilityRoles: normVisibilityRoles,
		};

		try {
			await this.adminRepo.updateRepo(value);

			if (this.router.url.includes('/app/admin/repos/edit/new')) {
				this.router.navigate(['/app/admin/repos']);
			}
		} catch (err) {
			console.error(err);
		}
		this.loadingSave = false;
		this.cdRef.markForCheck();
	}

	setVisibility(value: 'public' | 'restricted') {
		this.form.patchValue({ visibility: value });
		this.cdRef.markForCheck();
	}

	addNewVisibilityRole() {
		const value = this.visibilityRolesForm.value.control?.trim().toLowerCase();
		if (!value) return;
		this.visibilityRoles.add(value);
		this.visibilityRolesForm.controls.control.reset();
		this.setVisibility('restricted');
		this.cdRef.markForCheck();
	}

	removeVisibilityRole(role: string) {
		if (!this.visibilityRoles.has(role)) return;
		this.visibilityRoles.delete(role);
		if (this.visibilityRoles.size <= 0) {
			this.setVisibility('public');
		} else {
			this.setVisibility('restricted');
		}
	}

	get disabledQuerySuggestions() {
		const val = this.form.controls.querySuggestions.controls.map((s) => s.value);
		return val?.find(s => s === '') !== undefined;
	}

	deleteQuerySuggestion(index: number) {
		this.form.controls.querySuggestions.removeAt(index);
	}

	addEmptyQuerySuggestion() {
		this.form.controls.querySuggestions.push(new FormControl('', { nonNullable: true }));
	}

	get disabledReplaceString() {
		const val = this.form.controls.replaceStrings.controls.map((s) => s.value);
		return !!val?.find(s => !s.s);
	}

	deleteReplaceString(index: number) {
		this.form.controls.replaceStrings.removeAt(index);
	}

	addEmptyReplaceString() {
		if (this.disabledReplaceString) return;
		this.form.controls.replaceStrings?.push(new FormGroup({
			s: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
			r: new FormControl('', { nonNullable: true })
		}));
	}

	private updateForm(value?: Partial<Repo> | null): void {
		if (!value) return;
		this.dbRepo = value;
		this.form.reset(undefined, { emitEvent: false });
		this.form.patchValue(value);
		this.visibilityRoles = new Set(value.visibilityRoles ?? []);
		this.changeReplaceStrings(value.replaceStrings ?? []);
		this.changeQuerySuggestions(value.querySuggestions ?? []);
		this.cdRef.markForCheck();
	}

	private changeQuerySuggestions(querySuggestions: string[]) {
		if (!querySuggestions || querySuggestions.length <= 0) return;
		const normStrings = _uniqWith(querySuggestions ?? [], _isEqual);
		
		this.form.controls.querySuggestions = this.builder.array<FormControl<string>>([]);
		const querySuggestionsArray = this.form.controls.querySuggestions;
		for (const element of normStrings) {
			const query = element;
			querySuggestionsArray.push(new FormControl(query, { nonNullable: true }));
		}
	}

	private changeReplaceStrings(replaceStrings: { s: string, r: string }[]) {
		if (!replaceStrings || replaceStrings.length <= 0) return;
		const normStrings = _uniqWith(replaceStrings ?? [], _isEqual);
		
		const arr = this.builder.array<FormGroup<{ s: FormControl<string>, r: FormControl<string> }>>([]);
		this.form.controls.replaceStrings = arr;
		
		for (const element of normStrings) {
			const replacer = element;
			const group = this.builder.group({
				s: this.builder.control(replacer.s, { nonNullable: true, validators: [Validators.required] }),
				r: this.builder.control(replacer.r, { nonNullable: true, validators: [] }),
			});
			arr.push(group);
		}

		this.form.controls.replaceStrings = arr;
	}
}
