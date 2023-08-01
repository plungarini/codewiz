import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import _isEqual from 'lodash-es/isEqual';
import _uniqWith from 'lodash-es/uniqWith';
import { Subscription } from 'rxjs';
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
export class RepoMetaComponent implements OnDestroy {
	@Input('repo') set setRepo(value: Repo | undefined | null) {
		this.updateForm(value);
	};
	
	private builder = new FormBuilder();
	private oldValue: Partial<Repo> | undefined;
	private saves = 0;
	private lastSave: Date = new Date();
	private isFirstValue = true;
	
	form = this.builder.group({
		id: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		name: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		logo: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		url: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		hide: this.builder.control(false),
		hostUrl: this.builder.control('', { nonNullable: true, validators: [Validators.required] }),
		replaceUrl: this.builder.control('', { nonNullable: true }),
		replaceStrings: this.builder.array<FormGroup<{ s: FormControl<string>, r: FormControl<string> }>>([]),
	}, { updateOn: 'blur' });
	showSection = false;

	private formSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private adminRepo: AdminRepoService,
	) {
		this.formSub = this.form.valueChanges.subscribe(() => {			
			let isEqual = false;
			const val = this.form.value;

			const newReplaceStrings = _uniqWith(
				val.replaceStrings?.map((r) => ({
					s: r.s || '', r: r.r || '',
				})) || [],
				_isEqual
			);
			
			if (this.oldValue) {
				const comparison = this.oldValue;
				delete comparison.createdAt;
				delete comparison.updatedAt;
				delete comparison.id;
				delete comparison.editPagesSearch;
				const normVal = {
					...val,
					replaceStrings: newReplaceStrings,
				};
				delete normVal.id;
				isEqual = _isEqual(comparison, normVal);
				/* console.log({ isEqual, comparison, normVal }) */
			}
			
			if (isEqual) return;


			if (this.oldValue) {
				if (val.name) this.oldValue.name = val.name;
				if (val.logo) this.oldValue.logo = val.logo;
				if (val.url) this.oldValue.url = val.url;
				this.oldValue.hide = !!val.hide;
				if (val.hostUrl) this.oldValue.hostUrl = val.hostUrl;
				if (val.replaceUrl) this.oldValue.replaceUrl = val.replaceUrl;
				if (val.replaceStrings) this.oldValue.replaceStrings = newReplaceStrings;
			}
			

			const normValue: Partial<Repo> = {
				...val,
				hide: !!val.hide,
				replaceStrings: newReplaceStrings,
			};
			
			this.save(normValue);
		});
	}

	ngOnDestroy(): void {
		this.formSub.unsubscribe();
	}

	toggleSection() {
		this.showSection = !this.showSection;
		this.cdRef.detectChanges();
	}

	save(value: Partial<Repo>) {
		if (this.isFirstValue) return;
		if (this.saves > 5) return console.error('Too many saves!');

		setTimeout(() => {
			const currentTime = new Date();
			const differenceInSeconds = Math.floor((currentTime.getTime() - this.lastSave.getTime()) / 1000);
			const canReset = differenceInSeconds >= 30;
			if(canReset) this.saves = 0;
		}, 1000 * 35);

		
		this.saves++;
		console.warn('Saving form...', value);
		this.adminRepo.updateRepo(value);
	}

	private updateForm(value?: Partial<Repo> | null): void {
		if (!value) return;
		this.form.reset(undefined, { emitEvent: false });
		this.form.patchValue(value);
		this.oldValue = {
			...value,
			hide: !!value.hide,
			replaceStrings: value.replaceStrings?.map((r) => ({
				s: r.s || '', r: r.r || '',
			}))
		}
		const normStrings = _uniqWith(this.oldValue.replaceStrings || [], _isEqual);
		this.oldValue.replaceStrings = normStrings;
		this.initReplaceStrings(value.replaceStrings || []);
		this.isFirstValue = false;
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
