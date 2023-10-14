import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';
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
	@Input() autoSelectIndex = 0;
	@Input() set setRepo(id: string | undefined) {
		if (!id) return;

		if (!this.docs.length) {
			this.setRepoQueue = id;
			return;
		};

		const index = this.docs.findIndex(d => d.id === id);
		if (index < 0) return;
		this.selectDoc(index);
	}
	@Output('onRepo') onRepo: EventEmitter<Repo> = new EventEmitter();
	
	@ViewChild('searchDocsInput') searchDocsInputElement: ElementRef<HTMLInputElement> | undefined;


	searchInput = new FormControl();
	selectedIndex = 0;
	docs: Repo[] = [];
	filteredDocs: Repo[] = [];
	filteredDocsGroups: { name: string; repos: Repo[] }[] = [];
	repo: Repo | undefined;
	cacheRepo: Repo | undefined;
	placeholder: string = 'Pick a Documentation';
	docsListLoaded: boolean = false;
	userRoles: string[] = [];
	
	private docsListSub: Subscription;
	private searchInputSub: Subscription;

	private setRepoQueue: string = '';

	constructor(
		private cdRef: ChangeDetectorRef,
		private route: ActivatedRoute,
		private permissions: UserPermissionsService,
		private repoService: UserRepoService,
	) {
		this.docsListSub = this.permissions.getPermissions$().pipe(
			switchMap((permissions) => {
				this.userRoles = permissions ?? [];
				return this.repoService.getAllSupportedDocs()
			}),
		).subscribe(docs => {
			this._handleDocsList(docs);
			this.cdRef.markForCheck();
		});

		this.searchInputSub = this.searchInput.valueChanges.subscribe(value => {
			this.selectedIndex = 0;

			if (!value) {
				setTimeout(() => {
					this.filteredDocs = this._filterDocs(value);
					this.filteredDocsGroups = this._groupDocsByCategory(this.filteredDocs);
					this.cdRef.markForCheck();
				}, 300);
				return;
			}

			// Filter the categorized repos based on the search value
			this.filteredDocs = this._filterDocs(value);
			this.filteredDocsGroups = this._groupDocsByCategory(this.filteredDocs);
		});
	}

	ngOnDestroy(): void {
		this.docsListSub.unsubscribe();
		this.searchInputSub.unsubscribe();
	}

	onFocus(): void {
		this.cacheRepo = this.repo;
		this.repo = undefined;
		this.cdRef.markForCheck();
	}

	onBlur(): void {
		this.repo = this.cacheRepo;
		this.cacheRepo = undefined;
		this.searchInput.setValue('');
		this.cdRef.markForCheck();
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

	hasPermissions(repo: Repo, roles: string[]) {
		return roles.some(role => repo.visibilityRoles?.includes(role));
	}

	selectDoc(i?: number, id?: string): void {
		if (!id && i === undefined) return;
		i = i ?? this.filteredDocs.findIndex(d => d.id === id);
		if (i <= -1) this.selectedIndex = 0;
		this.repo = this.filteredDocs[i];
		if (!this.repo) return;
		this.cacheRepo = this.filteredDocs[i];
		this.onRepo.emit(this.filteredDocs[i])
		this.searchDocsInputElement?.nativeElement.focus();
		setTimeout(() => {
			this.searchDocsInputElement?.nativeElement.blur();
		});
		this.selectedIndex = 0;
		this.searchInput.setValue('');
		this.cdRef.detectChanges();
	}

	private _handleDocsList(docs: Repo[], force?: boolean): void {
		if (!this.docsListLoaded) {
			this.docsListLoaded = true;
		}

		this.docs = docs.filter((repo) => {
			if (repo.visibility === 'public') return true;
			const condition = this.userRoles.some(role => repo?.visibilityRoles?.includes(role));
			return condition;
		});
		this.filteredDocsGroups = this._groupDocsByCategory(this.docs);

		if (force || (!this.searchInput.value && !this.repo && !this.cacheRepo)) {
			this._handleRepoSelection();
		} else {
			this.filteredDocs = this._filterDocs(this.searchInput.value);
		}
	}

	private _handleRepoSelection(): void {
		const repoParam = this.route.snapshot.paramMap.get('repo');

		if (!repoParam && this.autoSelect && !this.setRepoQueue) {
			return this.selectDoc(this.autoSelectIndex);
		}

		if (this.setRepoQueue) {
			this.selectDoc(undefined, this.setRepoQueue);
			this.setRepoQueue = '';
			return;
		}

		this.filteredDocs = this._filterDocs('');
		const index = this.filteredDocs.findIndex(d => d.id === repoParam);

		if (index < 0 && this.autoSelect) {
			this.selectDoc(this.autoSelectIndex);
		} else {
			this.selectDoc(index);
		}
	}

	private _filterDocs(value: string): Repo[] {
		this.selectedIndex = 0;
		if (!value) return this.docs;
		return this.docs.filter(doc => {
			const normedSearch = value.toLowerCase().split(' ');
			let match = false;
			for (const element of normedSearch) {
				const s = element;
				if (match) continue;
				match = doc.id.toLowerCase().includes(s) || doc.name.toLowerCase().includes(s);
			}
			return match;
		})
	}

	private _groupDocsByCategory(docs: Repo[]): { name: string; repos: Repo[] }[] {
    const categoriesMap = new Map<string, Repo[]>();

		for (const repo of docs) {
			const category = repo.category;

			if (!categoriesMap.has(category)) {
				categoriesMap.set(category, []);
			}

			categoriesMap.get(category)?.push(repo);
		}

		const categorizedRepos: { name: string; repos: Repo[] }[] = [];

		categoriesMap.forEach((repos, category) => {
			categorizedRepos.push({ name: category, repos });
		});

		return categorizedRepos;
	}

}
