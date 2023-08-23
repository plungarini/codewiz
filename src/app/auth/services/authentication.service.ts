import { Injectable } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';
import {
	AuthProvider,
	confirmPasswordReset,
	createUserWithEmailAndPassword,
	getAuth,
	GithubAuthProvider,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut
} from '@angular/fire/auth';
import { doc, getDoc, getFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { FirebaseErrorHandling } from '../namespaces/error-auth';
import { UsersService } from './users.service';
	
	
@Injectable({
	providedIn: 'root'
})
export class AuthenticationService {
		
	private auth = getAuth();
	
	constructor(
		private userService: UsersService,
		private analytics: Analytics,
		private router: Router,
		private db: FirebaseExtendedService,
	) {	}
	
	/**
		* Performs a Login with GOOGLE provider through Firebase.
		*/
	googleLogin(): Promise<boolean> {
		const provider = new GoogleAuthProvider();
		return this.oAuthLogin(provider);
	}
	
	/**
		* Performs a Login with GITHUB provider through Firebase.
		*/
	githubLogin(): Promise<boolean> {
		const provider = new GithubAuthProvider();
		return this.oAuthLogin(provider);
	}
	
	/**
		* Performs a Login with EMAIL provider through Firebase.
		*/
	async emailLogin(email: string, password: string): Promise<void> {
		await signInWithEmailAndPassword(this.auth, email, password);

		const uid = this.auth.currentUser?.uid;
		logEvent(this.analytics, 'login', { provider: 'email', uid });
		
		this.redirectAfterSignIn();
	}
	
	/**
		* Performs a Signup with EMAIL provider through Firebase.
		*/
	async emailSignup(email: string, password: string, additionalDetails?: any): Promise<boolean | string> {
		try {
			const credential = await createUserWithEmailAndPassword(this.auth, email, password);
			if (!credential.user) throw new Error('User has not been created');
			await this.userService.editOrCreate(credential.user, true, additionalDetails, true);
			
			logEvent(this.analytics, 'sign_up', {
				provider: credential.providerId,
				uid: credential.user.uid,
				name: credential.user.displayName,
				email: credential.user.email,
			});

			this.redirectAfterSignIn();
			return true;
		} catch (e: any) {
			return e;
		}
	}
	
	/**
		* This method will send an email with a verification code.
		*
		* @param email Requires user email to send a verification code.
		*/
	async sendResetPswEmail(email: string): Promise<any> {
		const fn = this.db.callFunction('emailActionCode');
		return await fn(email);
	}
	
	/**
		* This method will reset the password with the provided one.
		*
		* @param code it should be set to the verification code sent by email to the user.
		* @param password it should be set to the new password to overwrite the old one.
		*/
	async resetPassword(code: string, password: string): Promise<any> {
		try {
			await confirmPasswordReset(this.auth, code, password);
			this.router.navigate(['/auth/login'], {
				queryParams: {
					resetPassword: true
				}
			});
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}
	
	/**
		* Signs out the user from the App.
		*/
	async signOut(): Promise<void> {
		const uid = this.auth.currentUser?.uid;
		this.router.navigateByUrl('/auth/login');
		localStorage.clear();
		await signOut(this.auth);
		logEvent(this.analytics, 'sign_out', { uid });
	}

	async disableUser(id: string): Promise<void> {
		const fn = this.db.callFunction<{ uid: string }, void>('disableUser');
		await fn({ uid: id });
	}

	async isUserDisabled(id: string): Promise<boolean> {
		const fn = this.db.callFunction<{ uid: string }, boolean>('isUserDisabled');
		const { data } = await fn({ uid: id });
		return data;
	}
	
	private async oAuthLogin(provider: AuthProvider): Promise<any> {
		try {
			const credential = await signInWithPopup(this.auth, provider);
			const userRef = doc(getFirestore(), `users/${credential.user.uid}`);
			const userSnap = await getDoc(userRef);
			const isSignup = !userSnap.exists();
			if (!credential.user) return;

			logEvent(this.analytics, 'login', {
				provider: credential.providerId,
				uid: credential.user.uid,
				name: credential.user.displayName,
				email: credential.user.email,
			});

			if (!isSignup) return this.redirectAfterSignIn();
			await this.userService.editOrCreate(
				credential.user, isSignup,
				{ phoneNumber: credential.user.phoneNumber },
				true,
			);
			this.redirectAfterSignIn();
		} catch (err: any) {
			console.error(err);
			throw FirebaseErrorHandling.convertMessage(err.code);
		}
	}
	
	private redirectAfterSignIn(): void {
		const returnUrl = localStorage.getItem('returnUrl');
		if (returnUrl) {
			this.router.navigate([returnUrl]);
			localStorage.removeItem('returnUrl');
		} else
			this.router.navigate(['/app']);
	}
}
