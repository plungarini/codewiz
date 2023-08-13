import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-query-input',
  templateUrl: './query-input.component.html',
  styles: [
    `
      :host {
				@apply absolute bottom-0 left-0 w-full px-6;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryInputComponent implements OnDestroy {

	@Input() showScrollToBottom = false;
	@Input() gettingQuery = false;
	@Output() onQuery = new EventEmitter<string>();
	@Output() onScrollBottom = new EventEmitter<void>();

	@ViewChild('textArea') textAreaComponent: ElementRef<HTMLDivElement> | undefined;

	textInput = new FormControl('', {
		nonNullable: true,
		validators: Validators.required
	});

	private routerSub: Subscription;

	constructor(
		private cdRef: ChangeDetectorRef,
		private router: Router,
	) {
		this.routerSub = this.router.events.pipe(
			filter((e) => e instanceof NavigationEnd)
		).subscribe((e) => {
			this.textAreaComponent?.nativeElement.focus();
			this.cdRef.detectChanges();
		})
	}

	ngOnDestroy(): void {
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

	submitMessage(): void {
		if (!this.textInput.valid || !this.textInput.value || this.gettingQuery) return;
		this.onQuery.emit(this.textInput.value.trim());
		this.resetTextInput();
		this.cdRef.detectChanges();
	}

	trackBy(index: number): number {
		return index;
	}

	private resetTextInput(): void {
		if (this.textAreaComponent)
			this.textAreaComponent.nativeElement.innerHTML = '';
		this.textInput.setValue('');
	}

}
