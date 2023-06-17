import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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

	constructor(
		private cdRef: ChangeDetectorRef,
		private passwordResetAlert: PasswordResetAlertService,
	) { }
	
	ngOnInit(): void {		
		this.alertSub = this.passwordResetAlert.getState()
			.subscribe((state) => {
				this.checkPRCompletion(state);
			})
	}

	ngOnDestroy(): void {
		this.alertSub?.unsubscribe();
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
