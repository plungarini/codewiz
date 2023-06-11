import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

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
export class QueryInputComponent {

	@Output() onQuery = new EventEmitter<string>();
	@ViewChild('textArea') textAreaComponent: ElementRef<HTMLDivElement> | undefined;

	textInput = new FormControl('', {
		nonNullable: true,
		validators: Validators.required
	});

	constructor(
		private cdRef: ChangeDetectorRef,
	) { }

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
				
				/*
					this.sendBtnClicked = true;
					this.cdRef.detectChanges();
				*/

				this.submitMessage();
				break;
		
			default:
				return;
		}
		
		/*
		setTimeout(() => {
			this.sendBtnClicked = false;
			this.cdRef.detectChanges();
		}, 100);
		*/
	}

	submitMessage(): void {
		if (!this.textInput.valid || !this.textInput.value) return;
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
