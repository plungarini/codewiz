import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseErrorHandling } from '../../namespaces/error-auth';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordResetAlertService } from '../../services/password-reset-alert.service';

@Component({
  templateUrl: './password-recovery.component.html',
  styles: [
    `
      :host {
        @apply block w-full pb-12;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordRecoveryComponent {

	passwordHide = false;
  passwordValidators = {
  	minLength: 8,
  	maxLength: 30
	};
	showLoadingBtn = false;

  resetPswForm = new FormGroup({
  	password: new FormControl('', [
  		Validators.required,
  		Validators.minLength(this.passwordValidators.minLength),
  		Validators.maxLength(this.passwordValidators.maxLength)
  	]),
  	passwordConfirm: new FormControl('', [ Validators.required ]),
  });
  verifyEmail = new FormGroup({
  	verifyEmailInput: new FormControl('', [Validators.required, Validators.email])
  });

  mode = this.route.snapshot.queryParams['mode'] || 'verifyEmail';
  oobCode = this.route.snapshot.queryParamMap.get('oobCode') || '';
  hide: boolean = true;
  serverErrMessage: string = '';
  sendAnotherLinkBtnDisabled = true;
  timePassing = 120;
  sendPswEmailTries = 0;
	emailInputSub: Subscription | undefined | null;
	
	constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
		private cdRef: ChangeDetectorRef,
		private passwordResetAlert: PasswordResetAlertService
	) { }
	
	ngOnInit(): void {
  	this.emailInputSub = this.verifyEmail.get('verifyEmailInput')?.valueChanges.subscribe(value => {
  		this.serverErrMessage = '';
		});
  }

  ngOnDestroy(): void {
  	this.emailInputSub?.unsubscribe();
  }

  getEmailErrMsg(): string {
  	if (this.verifyEmail.get('verifyEmailInput')?.hasError('required')) {
  		return 'Email is required';
  	}

  	return this.verifyEmail.get('verifyEmailInput')?.hasError('email') ? 'This is not a valid email' : '';
  }

  getPasswErrMsg(): string {
  	if (this.resetPswForm.get('password')?.hasError('required')) {
  		return 'Password is required';
  	}
  	if (this.resetPswForm.get('password')?.hasError('minlength')) {
  		return `Password should be at least ${this.passwordValidators.minLength} characters long.`;
  	}
  	if (this.resetPswForm.get('password')?.hasError('maxlength')) {
  		return `Password should not exceed ${this.passwordValidators.maxLength} characters.`;
  	}
  	return 'This is not a valid password';
  }

  canResetPsw(): boolean {
  	const password = this.resetPswForm.get('password')?.value;
  	const confirmPassword = this.resetPswForm.get('passwordConfirm')?.value;

  	if (this.resetPswForm.invalid) return false;
  	if (password !== confirmPassword) return false;

  	return true;
  }

  resetPassword(): any {
  	const password = this.resetPswForm.get('password')?.value;

  	if (!this.canResetPsw() || !password) return;
  	this.authService.resetPassword(this.oobCode, password)
  		.then(res => {
				this.passwordResetAlert.setState(true);
				this.router.navigateByUrl('/auth/login');
  		})
  		.catch(res => {
  			// eslint-disable-next-line max-len
  			this.serverErrMessage = 'The code can be expired. Try to get back to the email verification process or reach out to our support if the problem persists.';
  			this.cdRef.detectChanges();
  		});
  }

  linkDisabledTimer(): void {
  	const clear = () => {
  		clearInterval(timer);
  		this.sendAnotherLinkBtnDisabled = false;
  		this.cdRef.detectChanges();
  		this.timePassing = 120;
  	};
  	const timer = setInterval(() => {
  		if (this.timePassing > 0) {
  			this.timePassing--;
  			this.cdRef.detectChanges();
  		} else clear();
  	}, 1000);
  }

  sendResPswEmail(): void {
		const email = this.verifyEmail.get('verifyEmailInput')?.value;
		this.showLoadingBtn = true;
		this.serverErrMessage = '';
		this.cdRef.detectChanges();
		
		if (!email) return;

  	this.authService.sendResetPswEmail(email)
  		.then((res: any) => {
  			this.mode = 'verifyEmailCode';
				this.sendPswEmailTries++;
				this.showLoadingBtn = false;
				this.linkDisabledTimer();
  			this.cdRef.detectChanges();
  		})
  		.catch((err: any) => {
  			console.error('ERR', err);
				this.serverErrMessage = FirebaseErrorHandling.convertMessage(err.code, 'en');
				this.showLoadingBtn = false;
  			this.cdRef.detectChanges();
  		});
  }

  sendAnotherLink(): void {
  	this.sendAnotherLinkBtnDisabled = true;
  	if (this.sendPswEmailTries >= 4) {
  		this.serverErrMessage = 'You tried too many times. Try again in 10 minutes.';
  		this.cdRef.detectChanges();
  		return;
  	}
  	this.sendResPswEmail();
  	this.linkDisabledTimer();
  }

}
