import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

	loading = false;
	selectedGoals = new Set<string>();

	constructor(
		private onboarding: OnboardingService,
		private router: Router,
		private cdRef: ChangeDetectorRef,
	) { }

	get canProceed(): boolean {
		return this.selectedGoals.size > 0;
	}

	selectGoal(goal: string): void {
		if (this.selectedGoals.has(goal)) {
			this.selectedGoals.delete(goal);
		} else {
			this.selectedGoals.add(goal);
		}
	}
	
	async submit(): Promise<void> {
		if (!this.canProceed || this.loading) return;
		this.loading = true;
		this.cdRef.markForCheck();
		try {
			await this.onboarding.updateDetails({
				goals: [...this.selectedGoals],
			});
			this.router.navigate(['/app/setup/ready']);
			this.loading = false;
			this.cdRef.markForCheck();
		} catch (error) {
			console.error(error);
			this.loading = false;
			this.cdRef.markForCheck();
		}
	}

}
