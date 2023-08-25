import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrevoService {

	private production = environment.production;
	private initialized = false;
	private killTries = 0;

	constructor() { }
	
	hide(): void {
		const brevo = (window as any)?.BrevoConversations as any | undefined;
		if (!brevo) return;
		this.initialize();
		const visible = brevo?._visible;
		if (!visible) return;
		const hasMethod = brevo.hasOwnProperty('minimizeWidget') && brevo.hasOwnProperty('hide');
		if (!hasMethod) return console.warn('[BREVO CONVERSATIONS] Unable to hide widget.');
		brevo?.minimizeWidget();
		brevo?.hide();
	}

	show(): void {
		if (!this.production) return;
		const brevo = (window as any)?.BrevoConversations as any | undefined;
		if (!brevo) return;
		this.initialize();
		const visible = brevo?._visible;
		if (visible) return;
		const hasMethod = brevo.hasOwnProperty('show');
		if (!hasMethod) return console.warn('[BREVO CONVERSATIONS] Unable to show widget.');
		brevo?.show();
	}

	remove(): void {
		const brevo = (window as any)?.BrevoConversations as any | undefined;
		if (!brevo) return;
		try {
			const hasMethod = brevo.hasOwnProperty('kill');
			if (!hasMethod) throw Error();
			brevo?.kill();
		} catch (err) {
			this.killTries++;
			if (this.killTries > 5) {
				console.warn('[BREVO CONVERSATIONS] Unable to kill widget. Reload the page.')
				return;
			}
 			setTimeout(() => {
				this.remove();
			}, 500 * this.killTries);
		}
	}

	initialize(): void {
		const brevo = (window as any)?.BrevoConversations as any | undefined;
		if (!brevo) return;
		if (this.initialized) return;
		if (!this.production) this.remove();
		this.initialized = true;
	}
}
