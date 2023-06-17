import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './pages/login/login.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';
import { SignupComponent } from './pages/signup/signup.component';

const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		children: [
			{
				path: 'login',
				component: LoginComponent
			},
			{
				path: 'email/action',
				component: PasswordRecoveryComponent
			},
			{
				path: 'reset/new-password',
				component: PasswordRecoveryComponent
			},
			{
				path: 'signup',
				component: SignupComponent
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'login'
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
