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
				data: {
					title: 'Login to CodeWiz - Your Personalized Developer Companion',
					description: 'Dive back into CodeWiz! Your go-to platform for instant code wisdom, quizzes, and so much more awaits. Let’s continue the coding journey together.',
				},
				component: LoginComponent
			},
			{
				path: 'email/action',
				data: {
					title: 'Reset Your CodeWiz Password - Get Back to Coding in No Time!',
					description: 'Lost your password? No worries! Quickly and securely reset your CodeWiz password here and dive back into your coding journey.'
				},
				component: PasswordRecoveryComponent
			},
			{
				path: 'reset/new-password',
				data: {
					title: 'Reset Your CodeWiz Password - Get Back to Coding in No Time!',
					description: 'Lost your password? No worries! Quickly and securely reset your CodeWiz password here and dive back into your coding journey.'
				},
				component: PasswordRecoveryComponent
			},
			{
				path: 'signup',
				data: {
					title: 'Join CodeWiz - Your Forever-Free Coding Companion',
					description: 'Dive into CodeWiz today! Sign up for free and unlock a universe of coding insights tailored just for you. Your journey to coding mastery begins here.'
				},
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
