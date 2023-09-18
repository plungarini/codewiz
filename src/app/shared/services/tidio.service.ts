import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

type TidioUser = {
	uid: string;
	email: string;
	name: string;
	phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class TidioService {

	private production = environment.production;
	private isReady = false;
	private queuePurged = false;
	private fnQueue: { fn: string, data: Partial<TidioUser> | undefined }[] = [];

	private checkQueueInterval = setInterval(() => {
		this._initialize();
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
			} else if (fn.fn === 'identify') {
				this.identify(fn.data);
			}
		}

		this.fnQueue = [];
		this.queuePurged = true;
	}, 500);

	constructor() { }

	hide() {
		if (!this._getConsent()) return;
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('hide');
			return;
		}
		const tidio = (window as any).tidioChatApi;
		if (!tidio || !tidio?.hasOwnProperty('hide'))
			return console.warn('[TIDIO] Unable to hide widget');
		tidio.hide();
	}
	
	show() {
		if (!this.production || !this._getConsent()) return;
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('show');
			return;
		}
		const tidio = (window as any).tidioChatApi;
		if (!tidio || !tidio?.hasOwnProperty('show'))
			return console.warn('[TIDIO] Unable to show widget');
		tidio.show();
	}

	identify(user?: Partial<TidioUser>): void {
		if (!this.production || !this._getConsent()) return;
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('identify', user);
			return;
		}
		const tidio = (window as any).tidioChatApi;
		if (!tidio || !tidio?.hasOwnProperty('setVisitorData')) {
			return console.warn('[TIDIO] Unable to set visitor data');
		}
		tidio.setVisitorData(user);
	}

	private _getConsent(): boolean {
		const termly = (window as any)?.Termly?.getConsentState();
		return !!termly?.performance;
	}

	private _initialize(): void {
		if (this.isReady) return;
		this.isReady = !!(window as any)?.tidioChatApi?.readyEventWasFired;
	};

	private _addToQueue(fn: string, data?: Partial<TidioUser>): void {
		const lastItem = this.fnQueue.length > 0 ? this.fnQueue[this.fnQueue.length - 1] : undefined;
		if (lastItem && lastItem.fn === fn) return;
		this.fnQueue.push({ fn, data });
	}
}
