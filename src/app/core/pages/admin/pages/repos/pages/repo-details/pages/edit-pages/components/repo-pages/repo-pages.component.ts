import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable, of, tap } from 'rxjs';
import { RepoPage } from '../../../../../../../../../../../shared/models/repo.model';

@Component({
  selector: 'app-repo-pages',
  templateUrl: './repo-pages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoPagesComponent {

	@Input('pages') set setPages(value: Observable<RepoPage[]>) {
		this.pages$ = value.pipe(
			tap(pages => this.pages = pages),
		);
	};

	@Output() manualElaborate = new EventEmitter<RepoPage>();
	@Output() previewContent = new EventEmitter<string>();
	@Output() excludePage = new EventEmitter<RepoPage>();
	@Output() updatePage = new EventEmitter<RepoPage>();

	pages$: Observable<RepoPage[]> = of([]);
	pages: RepoPage[] = [];
	input = new FormControl('', { nonNullable: true, validators: Validators.required });
	isEditMode: boolean[] = [];

	constructor(
		private cdRef: ChangeDetectorRef,
	) {	}

	manualElaborateClick(page: RepoPage) {
		this.manualElaborate.emit(page);
	}

	deletePage(page: RepoPage) {
		this.excludePage.emit(page);
	}

	showEditTitle(page: RepoPage, index: number) {
		this.isEditMode[index] = true;
		this.input.patchValue(page.title, { emitEvent: false });
		this.cdRef.markForCheck();
	}

	editPage(page: RepoPage) {
		const value = this.input.value;
		if (!value) return;
		const index = this.isEditMode.findIndex(i => i);
		if (page.title === value) return;

		console.log(this.isEditMode, index)
		for (let i = 0; i < this.isEditMode.length; i++) {
			this.isEditMode[i] = false;
		}
		this.pages[index].title = value;
		this.updatePage.emit(this.pages[index]);
		this.cdRef.markForCheck();
	}

	cancelEdit() {
		this.input.patchValue('', { emitEvent: false });
		for (let i = 0; i < this.isEditMode.length; i++) {
			this.isEditMode[i] = false;
		}
		this.cdRef.markForCheck();
	}

	previewContentClick(content: string) {
		this.previewContent.emit(content);
	}

}
