import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-query-input',
  templateUrl: './query-input.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryInputComponent {

	textInput = new FormControl('', {
		nonNullable: true,
		validators: Validators.required
	});

	constructor(
		// private cdRef: ChangeDetectorRef,
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
		// TODO: Send query
		console.log('submitMessage');
	}

	trackBy(index: number): number {
		return index;
	}

}
