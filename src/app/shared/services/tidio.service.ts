import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

type TidioUser = {
	distinct_id: string;
	email: string;
	name: string;
	phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class TidioService {

  private production = environment.production;

	constructor() { }

	hide() {
		if (!this.production) return;
		const tidio = (window as any).tidioChatApi;
		if (!tidio || !tidio?.hasOwnProperty('hide'))
			return console.warn('[TIDIO] Unable to hide widget');
		tidio.hide();
	}
	
	show() {
		if (!this.production) return;
		const tidio = (window as any).tidioChatApi;
		if (!tidio || !tidio?.hasOwnProperty('show'))
			return console.warn('[TIDIO] Unable to show widget');
		tidio.show();
	}

	identify(user?: Partial<TidioUser>): void {
		if (!this.production) return;
		const tidio = (window as any).tidioChatApi;
		if (!tidio || !tidio?.hasOwnProperty('setVisitorData')) {
			return console.warn('[TIDIO] Unable to set visitor data');
		}
		tidio.setVisitorData(user);
	}
}
