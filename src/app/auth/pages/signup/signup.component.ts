import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirebaseErrorHandling } from '../../namespaces/error-auth';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  templateUrl: './signup.component.html',
  styles: [
    `
      :host {
        @apply block w-full pb-12;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent implements OnInit {

	passwordValidators = {
  	minLength: 8,
  	maxLength: 30
	};

  form = new FormGroup({
  	name: new FormControl('', []),
  	email: new FormControl('', [Validators.required, Validators.email]),
  	password: new FormControl('', [
  		Validators.required,
  		Validators.minLength(this.passwordValidators.minLength),
  		Validators.maxLength(this.passwordValidators.maxLength)
		]),
		passwordConfirm: new FormControl('', [ Validators.required ]),
  	termsAndConditions: new FormControl(false)
  });
  loginError: string = '';
	hide = true;
	loading = false;
	
	returnUrl: string | null = null;

	constructor(
		private auth: AuthenticationService,
		private route: ActivatedRoute,
		private cdRef: ChangeDetectorRef,
	) {	}

	ngOnInit(): void {
		this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || localStorage.getItem('returnUrl');
		localStorage.setItem('returnUrl', this.returnUrl || '/app');
	}

	async googleLogin(): Promise<void> {
		if (!this.form.value.termsAndConditions) {
			this.loginError = 'You must accept Terms and Conditions before continuing.';
			this.cdRef.markForCheck();
			return;
		}

		this.loginError = '';
		this.loading = true;
		this.cdRef.markForCheck();
		try {
			await this.auth.googleLogin();
		} catch (error: any) {
			this.loginError = error;
		}
		this.loading = false;
		this.cdRef.markForCheck();
	}

	async githubLogin(): Promise<void> {
		if (!this.form.value.termsAndConditions) {
			this.loginError = 'You must accept Terms and Conditions before continuing.';
			this.cdRef.markForCheck();
			return;
		}

		this.loginError = '';
		this.loading = true;
		this.cdRef.markForCheck();
		try {
			await this.auth.githubLogin();
		} catch (error: any) {
			this.loginError = error;
		}
		this.loading = false;
		this.cdRef.markForCheck();
	}

  getEmailErrMsg(): string {
  	if (this.form.controls.email.hasError('required')) {
  		return 'Email is required';
  	}

  	return this.form.controls.email.hasError('email') ? 'This is not a valid email' : '';
  }

  getPasswErrMsg(): string {
  	if (this.form.controls.password.hasError('required')) {
  		return 'Password is required';
  	}
  	if (this.form.controls.password.hasError('minlength')) {
  		return `Password should be at least ${this.passwordValidators.minLength} characters long.`;
  	}
  	if (this.form.controls.password.hasError('maxlength')) {
  		return `Password should not exceed ${this.passwordValidators.maxLength} characters.`;
  	}
  	return 'This is not a valid password';
  }

  async emailSignup(form: FormGroup): Promise<void> {
  	if (!form.controls['termsAndConditions'].value) {
  		this.loginError = 'You should accept Terms and Conditions before continuing.';
  		return;
  	}

		this.loginError = '';
		this.loading = true;
		this.cdRef.markForCheck();
		
		try {
			await this.auth.emailSignup(
				form.value.email,
				form.value.password,
				{ fullName: form.value.name || '' }
			);
		} catch (error) {
			this.loginError = FirebaseErrorHandling.convertMessage((error as any).code, 'it');
		}

		this.loading = false;
		this.cdRef.markForCheck();
  }

}
