import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RealFeedbackService {

	constructor(
		@Inject(DOCUMENT) private document: Document,
	) { }
	
	show() {
		const el = this.document.querySelector('#__realfeedback-root') as HTMLDivElement | undefined;
		if (!el) return;
		el.style.display = 'block';
	}

	hide() {
		const el = this.document.querySelector('#__realfeedback-root') as HTMLDivElement | undefined;
		if (!el) return;
		el.style.display = 'none';
	}
}
