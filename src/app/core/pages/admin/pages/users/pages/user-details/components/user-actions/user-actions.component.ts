import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { User } from 'src/app/auth/models/user.model';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

@Component({
  selector: 'app-user-actions',
  templateUrl: './user-actions.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsComponent {

	@Input('user') set setUser(user: User | undefined) {
		this.user = user;
		this.isUserDisabled();
	}

	user: User | undefined;
	isDisabled: boolean = false;

	loading = true;

	constructor(
		private authService: AuthenticationService,
		private cdRef: ChangeDetectorRef,
	) { }

	async isUserDisabled() {
		if (!this.user?.id) {
			this.loading = false;
			this.cdRef.markForCheck();
			return;
		}
		this.loading = true;
		this.cdRef.markForCheck();

		this.isDisabled = await this.authService.isUserDisabled(this.user?.id);

		this.loading = false;
		this.cdRef.markForCheck();
	}

	async disableUser() {
		if (!this.user?.id) {
			this.loading = false;
			this.cdRef.markForCheck();
			return;
		}
		this.loading = true;
		this.cdRef.markForCheck();

		await this.authService.disableUser(this.user.id);
		await this.isUserDisabled();

		this.loading = false;
		this.cdRef.markForCheck();
	}

}
