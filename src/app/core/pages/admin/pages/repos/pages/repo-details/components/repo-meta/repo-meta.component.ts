import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
		if (!value) return;
		this.form.patchValue(value);
		this.oldValue = value;
		this.initReplaceStrings(value.replaceStrings);
		console.log(this.form.value);
	};
	
	private builder = new FormBuilder();
	private oldValue: Repo | undefined;
	
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
		this.formSub = this.form.valueChanges.subscribe((val) => {
			const normValue: Partial<Repo> = {
				...val,
				hide: !!val.hide,
				replaceStrings: val.replaceStrings?.map((r) => ({
					s: r.s || '', r: r.r || '',
				}))
			}
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
		console.log(value);
		console.warn('Saving form...');
		this.adminRepo.updateRepo(value);
	}

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
