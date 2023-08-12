import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PasswordResetAlertService } from './services/password-reset-alert.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: []
})
export class AuthComponent implements OnInit, OnDestroy {

	showPRBanner = false;
	showHeaderBg = true;
	
	alertSub: Subscription | undefined;

	private observer: MutationObserver | undefined;

	constructor(
		private cdRef: ChangeDetectorRef,
		private passwordResetAlert: PasswordResetAlertService,
		@Inject(DOCUMENT) private document: Document,
	) {
		this.observer = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					const addedNodes = mutation.addedNodes;
					addedNodes.forEach((node) => {
						if (
							node instanceof HTMLIFrameElement &&
							(
								node.src?.includes('https://codewiz.app/__/auth') ||
								node.getAttribute('data-src')?.includes('https://codewiz.app/__/auth')
							)
						) {
							const newSrc = node.src || node.getAttribute('data-src');
							const alreadyAdded = document.body.querySelector('iframe[data-autoblock-bypass="true"]');
							const isDifferent = newSrc !== alreadyAdded?.getAttribute('src');

							if (isDifferent || !newSrc) return;
							
							const newIframe = document.createElement('iframe');
							Array.from(node.attributes).forEach((attr) => {
								newIframe.setAttribute(attr.name, attr.value);
							});
							newIframe.removeAttribute('data-autoblocked');
							newIframe.removeAttribute('data-src');
							newIframe.setAttribute('src', newSrc);
							newIframe.setAttribute('data-categories', 'essential');
							newIframe.setAttribute('data-autoblock-bypass', 'true');

							node.remove();
							this.document.body.appendChild(newIframe);
						}
					})
				}
			}
		});
	
		this.observer.observe(this.document.body, { childList: true, subtree: true });
	}
	
	ngOnInit(): void {		
		this.alertSub = this.passwordResetAlert.getState()
			.subscribe((state) => {
				this.checkPRCompletion(state);
			})
	}

	ngOnDestroy(): void {
		this.alertSub?.unsubscribe();
		this.observer?.disconnect();
	}

	checkPRCompletion(state: boolean): void {
		this.showPRBanner = state;
		this.cdRef.detectChanges();
	}

	checkHeaderBg(state: boolean): void {
		this.showHeaderBg = state;
		this.cdRef.detectChanges();
	}

	dismissPRCompletionBanner(): void {
		this.passwordResetAlert.setState(false);
	}

}
