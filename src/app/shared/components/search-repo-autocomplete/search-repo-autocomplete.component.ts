import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Repo } from 'src/app/shared/models/repo.model';
import { UserRepoService } from '../../../core/pages/chat/services/user-repo.service';


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

	@Input() size: 'st' | 'lg' = 'st';
	@Input() autoSelect = true;
	@Output('onRepo') onRepo: EventEmitter<Repo> = new EventEmitter();
	
	@ViewChild('searchDocsInput') searchDocsInputElement: ElementRef<HTMLInputElement> | undefined;

	searchInput = new FormControl();
	selectedIndex = 0;
	docs: Repo[] = [];
	filteredDocs: Repo[] = [];
	repo: Repo | undefined;
	cacheRepo: Repo | undefined;
	placeholder: string = 'Select a repo';

	docsListLoaded: boolean = false;
	searchInputSub: Subscription;
	docsListSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private repoService: UserRepoService,
		private route: ActivatedRoute,
	) {
		this.docsListSub = this.repoService.getAllSupportedDocs().subscribe(d => {
			if (!this.docsListLoaded) this.docsListLoaded = true;
			this.docs = d;

			this.filteredDocs = this._filterDocs(this.searchInput.value);
			const repoParam = this.route.snapshot.paramMap.get('repo');

			if (!this.searchInput.value && !this.repo && !this.cacheRepo) {

				if (!repoParam && this.autoSelect) {
					this.selectDoc(0);
				} else {
					this.filteredDocs = this._filterDocs('');
					const index = this.filteredDocs.findIndex(d => d.id === repoParam);
					if (index < 0 && this.autoSelect) {
						this.selectDoc(0);
					} else {
						this.selectDoc(index);
					}
				}
			}
			this.cdRef.detectChanges();
		});

		this.searchInputSub = this.searchInput.valueChanges.subscribe(value => {
			this.selectedIndex = 0;

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
		this.cacheRepo = this.repo;
		this.repo = undefined;
		this.cdRef.detectChanges();
	}

	onBlur(): void {
		this.repo = this.cacheRepo;
		this.cacheRepo = undefined;
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
		this.repo = this.filteredDocs[i];
		this.cacheRepo = this.filteredDocs[i];
		this.onRepo.emit(this.filteredDocs[i])
		this.searchDocsInputElement?.nativeElement.focus();
		setTimeout(() => {
			this.searchDocsInputElement?.nativeElement.blur();
		});
		this.selectedIndex = 0;
		this.searchInput.setValue('');
		this.cdRef.markForCheck();
	}

	private _filterDocs(value: string): Repo[] {
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
