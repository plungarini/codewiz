import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import _isEqual from 'lodash-es/isEqual';
import { map, Subscription, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';


@Component({
  templateUrl: './profile.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnDestroy {

	user$ = this.usersService.user$;
	fireUser$ = this.usersService.fireUser$;
	
	form = new FormGroup({
		firstName: new FormControl('', { validators: [Validators.required], nonNullable: true }),
		lastName: new FormControl('', { validators: [Validators.required], nonNullable: true }),
		email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
		phone: new FormControl('', { nonNullable: true }),
		imgUrl: new FormControl('', { nonNullable: true }),
	});

	error = '';
	successMessage = '';

	private updatedDetails: {
		uid?: string;
		firstName?: string;
		lastName?: string;
		phone?: string;
		imgUrl?: string;
	} = {
			uid: '',
			firstName: '',
			lastName: '',
			phone: '',
			imgUrl: '',
		};
	private isFormUpdated = false;
	private userSub: Subscription;
	private formSub: Subscription;

	constructor(
		private usersService: UsersService,
		private cdRef: ChangeDetectorRef,
	) {
		this.userSub = this.usersService.user$.pipe(
			switchMap(user => {
				return this.usersService.fireUser$.pipe(
					map(fireUser => ({ user, fireUser }))
				);
			})
		).subscribe(({ user, fireUser }) => {
			if (this.isFormUpdated) return;

			this.updatedDetails.uid = user?.id || fireUser?.uid;

			const updatedName = (user?.name || fireUser?.displayName || 'Anonymous');
			const updatedLastName = updatedName.split(' ').pop() || '';
			const updatedFirstName = updatedName.split(' ').slice(0, -1).join(' ');

			if (!!updatedFirstName) {
				this.updatedDetails.firstName = updatedFirstName;
				this.form.patchValue({ firstName: updatedFirstName });
			}
			if (!!updatedLastName) {
				this.updatedDetails.lastName = updatedLastName;
				this.form.patchValue({ lastName: updatedLastName });
			}

			const updatedEmail = user?.email || fireUser?.email;
			if (!!updatedEmail) {
				this.form.patchValue({ email: updatedEmail });
			}

			const updatedPhone = user?.details?.phoneNumber || fireUser?.phoneNumber;
			if (!!updatedPhone) {
				this.updatedDetails.phone = updatedPhone;
				this.form.patchValue({ phone: updatedPhone });
			}

			const updatedImgUrl = user?.details?.imgUrl || fireUser?.photoURL;
			if (!!updatedImgUrl) {
				this.updatedDetails.imgUrl = updatedImgUrl;
				this.form.patchValue({ imgUrl: updatedImgUrl });
			}
			
			this.isFormUpdated = true;
			this.cdRef.markForCheck();
		});

		this.formSub = this.form.valueChanges.subscribe(() => {
			if (this.error) {
				this.error = '';
				this.cdRef.detectChanges();
			}
		});

	}

	get isFormEqual(): boolean {
		const { firstName, lastName, phone, imgUrl } = this.form.value;

		const formValue = {
			uid: this.updatedDetails.uid,
			firstName,
			lastName,
			phone,
			imgUrl,
		};

		return _isEqual(this.updatedDetails, formValue);
	}

	ngOnDestroy(): void {
		this.userSub.unsubscribe();
		this.formSub.unsubscribe();
	}

	async saveDetails(): Promise<void> {
		console.log('Saving details...', this.form.value);

		this.error = '';
		this.cdRef.markForCheck();

		if (this.isFormEqual) {
			this.error = 'The form is equal, nothing to save.';
			this.cdRef.markForCheck();
			return;
		}

		if (this.form.invalid) {
			this.error = 'The form is invalid, make sure all required fields are filled.';
			console.error(this.form.errors);
			this.cdRef.markForCheck();
			return;
		}

		if (!this.updatedDetails.uid) {
			this.error = 'Login session expired, login again.';
			this.cdRef.markForCheck();
			return;
		}

		const { firstName, lastName, phone, imgUrl } = this.form.value;

		if (!firstName || !lastName) {
			this.error = 'The form is invalid, make sure all required fields are filled.';
			console.error(this.form.errors);
			this.cdRef.markForCheck();
			return;
		}

		try {
			await this.usersService.edit(this.updatedDetails.uid, {
				name: `${firstName} ${lastName}`,
				details: {
					phoneNumber: phone,
					imgUrl: imgUrl,
				}
			});
			this.isFormUpdated = false;

			this.successMessage = 'Details updated successfully.';
			this.cdRef.detectChanges();

			setTimeout(() => {
				this.successMessage = '';
				this.cdRef.detectChanges();
			}, 3000);
		} catch (err) {
			this.error = 'An error occurred, please try again later.';
			this.cdRef.markForCheck();
		}
	}
	
}
