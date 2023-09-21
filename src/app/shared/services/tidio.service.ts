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

	private production = false;
	private isReady = false;
	private queuePurged = false;
	private fnQueue: {
		fn: string;
		data: Partial<TidioUser> | undefined;
		message?: string;
	}[] = [];

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

		for (const element of this.fnQueue) {
			const fn = element;
			if (fn.fn === 'hide') {
				this.hide();
			} else if (fn.fn === 'show') {
				this.show();
			} else if (fn.fn === 'identify') {
				this.identify(fn.data);
			} else if (fn.fn === 'sendUserMessage') {
				this.sendUserMessage(fn.message);
			}
		}

		this.fnQueue = [];
		this.queuePurged = true;
	}, 500);

	constructor() {
		this.production = false;
		try {
			this.production = eval(environment.production)
		} catch (err) {
			this.production = false;
			console.error(err);
		}
	}

	sendUserMessage(message?: string) {
		if (!this.production || !this._getConsent() || !message) return;
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('sendUserMessage');
			return;
		}
		const tidio = (window as any).tidioChatApi;
		if (!tidio?.hasOwnProperty('messageFromOperator')) {
			return console.warn('[TIDIO] Unable to send message');
		}
		this.show();
		tidio.messageFromOperator(message);
	}

	hide() {
		if (!this._getConsent()) return;
		this._initialize();
		if (!this.isReady && !this.queuePurged) {
			this._addToQueue('hide');
			return;
		}
		const tidio = (window as any).tidioChatApi;
		if (!tidio?.hasOwnProperty('hide'))
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
		if (!tidio?.hasOwnProperty('show'))
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
		if (!tidio?.hasOwnProperty('setVisitorData')) {
			return console.warn('[TIDIO] Unable to set visitor data');
		}
		tidio.setVisitorData(user);
		tidio.setContactProperties({ uid: user?.uid });
	}

	private _getConsent(): boolean {
		const termly = (window as any)?.Termly?.getConsentState();
		return !!termly?.performance;
	}

	private _initialize(): void {
		if (this.isReady) return;
		this.isReady = !!(window as any)?.tidioChatApi?.readyEventWasFired;
	};

	private _addToQueue(fn: string, data?: Partial<TidioUser>, message?: string): void {
		const lastItem = this.fnQueue.length > 0 ? this.fnQueue[this.fnQueue.length - 1] : undefined;
		if (lastItem && lastItem.fn === fn) return;
		this.fnQueue.push({ fn, data, message });
	}
}
