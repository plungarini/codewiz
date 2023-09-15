import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealFeedbackService {

	private production = environment.production;
	private isReady = false;
	private queuePurged = false;
	private fnQueue: { fn: string }[] = [];

	private checkQueueInterval = setInterval(() => {
		if (!this.isReady) return;
		if (this.queuePurged || !this.production) {
			clearInterval(this.checkQueueInterval);
			return;
		}
		if (this.fnQueue.length <= 0) {
			this.queuePurged = true;
			return;
		}

		for (let i = 0; i < this.fnQueue.length; i++) {
			const fn = this.fnQueue[i];
			if (fn.fn === 'hide') {
				this.hide();
			} else if (fn.fn === 'show') {
				this.show();
			}
		}

		this.fnQueue = [];
		this.queuePurged = true;
	}, 500);

	constructor(
		@Inject(DOCUMENT) private document: Document,
	) { }
	
	show() {
		if (!this.production) return;
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('show');
			return;
		}
		const el = this.document.querySelector('#__realfeedback-root') as HTMLDivElement | undefined;
		if (!el) return;
		el.style.display = 'block';
	}

	hide() {
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('hide');
			return;
		}
		const el = this.document.querySelector('#__realfeedback-root') as HTMLDivElement | undefined;
		if (!el) return;
		el.style.display = 'none';
	}

	private _initialize(): void {
		if (this.isReady) return;
		this.isReady = !!this.document.querySelector('#__realfeedback-root');
	};

	private _addToQueue(fn: string): void {
		const lastItem = this.fnQueue.length > 0 ? this.fnQueue[this.fnQueue.length - 1] : undefined;
		if (lastItem && lastItem.fn === fn) return;
		this.fnQueue.push({ fn });
	}
}
