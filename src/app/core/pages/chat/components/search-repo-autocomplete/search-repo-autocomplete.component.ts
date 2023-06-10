import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

type Docs = {
	id: string;
	name: string;
	logo: string;
}

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
	@Output('onSelectedDocs') onSelectedDocs: EventEmitter<Docs> = new EventEmitter()

	searchInput = new FormControl();
	selectedIndex = 0;
	docs: Docs[] = [];
	filteredDocs: Docs[] = [];
	selectedDocs: Docs | undefined;
	cacheSelectedDocs: Docs | undefined;
	placeholder: string = 'Search a repo';

	docsListLoaded: boolean = false;
	searchInputSub: Subscription;
	docsListSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private db: FirebaseExtendedService,
	) {
		this.docsListSub = this.db.getCol<Docs>('supported-docs').subscribe(d => {
			if (!this.docsListLoaded) this.docsListLoaded = true;
			this.docs = d.sort((a, b) => {
				const nameA = a.name.toUpperCase(); // Convert to uppercase for case-insensitive sorting
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

			if (!this.searchInput.value && !this.selectedDocs && !this.cacheSelectedDocs) {
				this.selectDoc(0);
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

	private _filterDocs(value: string): Docs[] {
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
