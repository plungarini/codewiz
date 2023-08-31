import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
export class SignupComponent {

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

	constructor(
		private auth: AuthenticationService,
		private cdRef: ChangeDetectorRef
	) { }

	async googleLogin(): Promise<void> {
		this.loginError = '';
		try {
			await this.auth.googleLogin();
		} catch (error: any) {
			this.loginError = error;
  		this.cdRef.detectChanges();
		}
	}

	async githubLogin(): Promise<void> {
		this.loginError = '';
		try {
			await this.auth.githubLogin();
		} catch (error: any) {
			this.loginError = error;
  		this.cdRef.detectChanges();
		}
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
		
		try {
			await this.auth.emailSignup(
				form.value.email,
				form.value.password,
				{ fullName: form.value.name || '' }
			);
		} catch (error) {
			this.loginError = FirebaseErrorHandling.convertMessage((error as any).code, 'it');
  		this.cdRef.detectChanges();
		}
  }

}
