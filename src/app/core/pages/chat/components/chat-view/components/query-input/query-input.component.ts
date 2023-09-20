import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { Repo } from 'src/app/shared/models/repo.model';
import { UserRepoService } from '../../../../services/user-repo.service';

@Component({
  selector: 'app-query-input',
  templateUrl: './query-input.component.html',
  styles: [
    `
      :host {
				@apply fixed md:absolute bottom-0 left-0 w-full px-6 pointer-events-none;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryInputComponent implements OnInit, OnDestroy {

	@Input() showScrollToBottom = false;
	@Input() gettingQuery = false;
	@Input('showSuggestions') set setShowSuggestions(value: boolean) {
		this.showSuggestions = value;
		if (!this.repo) return;
		this._showSuggestions = value;
	};
	@Input('repoId') set setRepoId(value: string) {
		this.selectedRepoId$.next(value);
	}
	@Output() onQuery = new EventEmitter<string>();
	@Output() onScrollBottom = new EventEmitter<void>();
	@Output() onShowMobileMenu = new EventEmitter<void>();

	@ViewChild('textArea') textAreaComponent: ElementRef<HTMLDivElement> | undefined;

	textInput = new FormControl('', {
		nonNullable: true,
		validators: Validators.required
	});
	repo: Repo | undefined;
	
	showSuggestions = false;
	_showSuggestions = false;
	private selectedRepoId$: BehaviorSubject<string> = new BehaviorSubject('angular');

	private repoSub: Subscription;
	private routerSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private repoService: UserRepoService,
		private router: Router,
	) {
		this.repoSub = this.selectedRepoId$.asObservable().pipe(
			switchMap((id) => {
				this._showSuggestions = false;
				this.cdRef.markForCheck();
				return this.repoService.getRepo(id);
			})
		).subscribe(repo => {
			this.repo = repo;
			setTimeout(() => {
				this._showSuggestions = this.showSuggestions;
				this.cdRef.markForCheck();
			}, 1000);
			this.cdRef.markForCheck();
		});
		
		this.routerSub = this.router.events.subscribe((e) => {
			this.textAreaComponent?.nativeElement.focus();
		})
	}

	ngOnInit(): void {
		this.textAreaComponent?.nativeElement.focus();
	}

	ngOnDestroy(): void {
		this.repoSub.unsubscribe();
		this.routerSub.unsubscribe();
	}

	scrollToBottom(): void {
		this.onScrollBottom.emit();
	}

	handleDummyInputChange(event: Event): void {
		const div = event.target as HTMLDivElement;
		if (!div) return;
		this.textInput.setValue(div.innerText || '');
	}

	handleKeypress(event: KeyboardEvent): void {
		if (!this.textInput.value) return;

		switch (event.key) {
			case 'Enter':
				if (event.shiftKey) return;
				event.preventDefault();
				event.stopImmediatePropagation();

				this.submitMessage();
				break;
		
			default:
				return;
		}
	}

	submitSuggestion(value: string): void {
		if (this.gettingQuery) return;
		this.showSuggestions = false;
		this.onQuery.emit(value.trim());
		this.resetTextInput();
		this.textAreaComponent?.nativeElement.blur();
		this.cdRef.markForCheck();
	}

	submitMessage(): void {
		if (!this.textInput.valid || !this.textInput.value || this.gettingQuery) return;
		this.onQuery.emit(this.textInput.value.trim());
		this.resetTextInput();
		this.textAreaComponent?.nativeElement.blur();
		this.cdRef.markForCheck();
	}

	trackBy(index: number): number {
		return index;
	}

	showMobileMenu(): void {
		this.onShowMobileMenu.emit();
	}

	private resetTextInput(): void {
		if (this.textAreaComponent)
			this.textAreaComponent.nativeElement.innerHTML = '';
		this.textInput.setValue('');
	}

}
