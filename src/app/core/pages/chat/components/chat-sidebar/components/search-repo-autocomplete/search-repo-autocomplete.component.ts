import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectedDocs } from 'src/app/shared/models/select-docs.model';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';


@Component({
  selector: 'app-search-repo-autocomplete',
  templateUrl: './search-repo-autocomplete.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchRepoAutocompleteComponent implements OnDestroy {

	@ViewChild('searchDocsInput') searchDocsInputElement: ElementRef<HTMLInputElement> | undefined;
	@Output('onSelectedDocs') onSelectedDocs: EventEmitter<SelectedDocs> = new EventEmitter()

	searchInput = new FormControl();
	selectedIndex = 0;
	docs: SelectedDocs[] = [];
	filteredDocs: SelectedDocs[] = [];
	selectedDocs: SelectedDocs | undefined;
	cacheSelectedDocs: SelectedDocs | undefined;
	placeholder: string = 'Search a repo';

	docsListLoaded: boolean = false;
	searchInputSub: Subscription;
	docsListSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private db: FirebaseExtendedService,
		private route: ActivatedRoute,
	) {
		this.docsListSub = this.db.getCol<SelectedDocs>('supported-docs').subscribe(d => {
			if (!this.docsListLoaded) this.docsListLoaded = true;
			this.docs = d.sort((a, b) => {
				// Convert to uppercase for case-insensitive sorting
				const nameA = a.name.toUpperCase();
				const nameB = b.name.toUpperCase();

				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0;
			});

			this.filteredDocs = this._filterDocs(this.searchInput.value);
			const repoParam = this.route.snapshot.paramMap.get('repo');

			if (!this.searchInput.value && !this.selectedDocs && !this.cacheSelectedDocs) {

				if (!repoParam) {
					this.selectDoc(0);
				} else {
					this.filteredDocs = this._filterDocs('');
					const index = this.filteredDocs.findIndex(d => d.id === repoParam);
					if (index < 0) {
						this.selectDoc(0);
					} else {
						this.selectDoc(index);
					}
				}
			}
			this.cdRef.detectChanges();
		});

		this.searchInputSub = this.searchInput.valueChanges.subscribe(value => {
			if (!value) {
				setTimeout(() => {
					this.filteredDocs = this._filterDocs(value);
					this.cdRef.detectChanges();
				}, 300);
				return;
			}
			this.filteredDocs = this._filterDocs(value);
		})
	}

	ngOnDestroy(): void {
		this.searchInputSub.unsubscribe();
	}

	onFocus(): void {
		this.cacheSelectedDocs = this.selectedDocs;
		this.selectedDocs = undefined;
		this.cdRef.detectChanges();
	}

	onBlur(): void {
		this.selectedDocs = this.cacheSelectedDocs;
		this.cacheSelectedDocs = undefined;
		this.searchInput.setValue('');
		this.cdRef.detectChanges();
	}

	handleKeypress(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			// Select current indexed docs
			this.selectDoc(this.selectedIndex);
		} else if (event.key === 'Escape') {
			// Close dropdown
			this.searchDocsInputElement?.nativeElement.blur();
			this.selectedIndex = 0;
			this.searchInput.setValue('');
		} else if (event.key === 'ArrowDown') {
			this.selectedIndex = (this.selectedIndex + 1) % this.filteredDocs.length;
		} else if (event.key === 'ArrowUp') {
			this.selectedIndex = (this.selectedIndex - 1 + this.filteredDocs.length) % this.filteredDocs.length;
		}
	}

	selectDoc(i: number): void {
		if (i <= -1) this.selectedIndex = 0;
		this.selectedDocs = this.filteredDocs[i];
		this.cacheSelectedDocs = this.filteredDocs[i];
		this.onSelectedDocs.emit(this.filteredDocs[i])
		this.searchDocsInputElement?.nativeElement.focus();
		setTimeout(() => {
			this.searchDocsInputElement?.nativeElement.blur();
		});
		this.selectedIndex = 0;
		this.searchInput.setValue('');
	}

	private _filterDocs(value: string): SelectedDocs[] {
		this.selectedIndex = 0;
		if (!value) return this.docs;
		return this.docs.filter(doc => {
			const normedSearch = value.toLowerCase().split(' ');
			let match = false;
			for (let i = 0; i < normedSearch.length; i++) {
				const s = normedSearch[i];
				if (match) continue;
				match = doc.id.toLowerCase().includes(s) || doc.name.toLowerCase().includes(s);
			}
			return match;
		})
	}

}
