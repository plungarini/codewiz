import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrevoService {

	private initialized = false;
	private brevo = (window as any)?.BrevoConversations as any | undefined;

	constructor() { }
	
	hide(): void {
		this.initialize();
		const visible = this.brevo?._visible;
		if (!visible) return;
		this.brevo?.minimizeWidget();
		this.brevo?.hide();
	}

	show(): void {
		this.initialize();
		const visible = this.brevo?._visible;
		if (visible) return;
		this.brevo?.show();
	}

	remove(): void {
		this.initialize();
		this.brevo.kill();
	}

	private initialize(): void {
		if (this.initialized) return;
		const prod = environment.production;
		if (!prod) this.brevo?.kill();
		this.initialized = true;
	}
}
