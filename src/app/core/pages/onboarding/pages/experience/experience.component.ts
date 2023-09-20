import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceComponent {

	loading = false;
	selectedExperience: string = '';

	constructor(
		private cdRef: ChangeDetectorRef,
		private onboarding: OnboardingService,
		private router: Router,
	) { }

	onChange(event: any): void {
		const value = event?.target?.value || '';
		if (this.selectedExperience !== value) {
			this.selectedExperience = value;
		} else {
			this.selectedExperience = '';
		}
		this.cdRef.markForCheck();
	}

	async submit(): Promise<void> {
		if (!this.selectedExperience || this.loading) return;
		this.loading = true;
		this.cdRef.markForCheck();
		try {
			await this.onboarding.updateDetails({
				experience: this.selectedExperience,
			});
			this.router.navigate(['/app/setup/goals']);
			this.loading = false;
			this.cdRef.markForCheck();
		} catch (error) {
			console.error(error);
			this.loading = false;
			this.cdRef.markForCheck();
		}
	}
}
