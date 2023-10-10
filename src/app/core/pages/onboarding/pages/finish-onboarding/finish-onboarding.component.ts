import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-finish-onboarding',
  templateUrl: './finish-onboarding.component.html',
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishOnboardingComponent implements OnInit {

	loading = true;
	canProceed = false;

	options: AnimationOptions = {
		path: '/assets/lottie/confetti.json',
		loop: 1,
		autoplay: true,
	};
	
	constructor(
		private onboarding: OnboardingService,
		private permissions: UserPermissionsService,
		private cdRef: ChangeDetectorRef,
	) {	}

	async ngOnInit(): Promise<void> {
		try {
			await this.onboarding.updateDetails({
				onboarded: true
			});
			const isUser = await this.permissions.hasAllPermissions(['user']);
	
			this.canProceed = isUser;
			this.loading = false;
			this.cdRef.markForCheck();
		} catch (err) {
			this.canProceed = false;
			this.loading = false;
			this.cdRef.markForCheck();
		}
	}

}
