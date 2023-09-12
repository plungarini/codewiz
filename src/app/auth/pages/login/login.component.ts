import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirebaseErrorHandling } from '../../namespaces/error-auth';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  templateUrl: './login.component.html',
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
	
	passwordValidators = {
  	minLength: 8,
  	maxLength: 30
  };

  form = new FormGroup({
  	email: new FormControl('', [Validators.required, Validators.email]),
  	password: new FormControl('', [
  		Validators.required,
  		Validators.minLength(this.passwordValidators.minLength),
  		Validators.maxLength(this.passwordValidators.maxLength)
  	])
  }, { updateOn: 'change' });
  loginError: string = '';
  hide = true;
	returnUrl: string | null = null;
	loading = false;

	constructor(
		private auth: AuthenticationService,
		private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
	) { }

	async googleLogin(): Promise<void> {
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

	ngOnInit(): void {
  	this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || localStorage.getItem('returnUrl');
		localStorage.setItem('returnUrl', this.returnUrl || '/app');
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

  async emailLogin(form: FormGroup): Promise<void> {
		this.loginError = '';
		this.loading = true;
		this.cdRef.markForCheck();
		try {
			await this.auth.emailLogin(
				form.value.email,
				form.value.password
			);
		} catch (error) {
			this.loginError = FirebaseErrorHandling.convertMessage((error as any)['code'], 'en');
		}
		this.loading = false;
		this.cdRef.markForCheck();
  }

}
