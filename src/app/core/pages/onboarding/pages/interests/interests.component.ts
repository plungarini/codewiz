import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRepoService } from '../../../chat/services/user-repo.service';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestsComponent {

	loading = false;
	customDocs: string[] = [];
	customDocsValues: string[] = [];
	repos$ = this.userRepoService.getAllSupportedDocs();

	private selectedDocs = new Set<string>();

	constructor(
		private userRepoService: UserRepoService,
		private onboarding: OnboardingService,
		private router: Router,
		private cdRef: ChangeDetectorRef,
	) { }

	get canProceed(): boolean {
		return this.selectedDocs.size > 0;
	}

	getCustomDocId(name?: string): string {
		return name?.toLowerCase()?.replace(' ', '-')?.trim() || '';
	}

	addCustomDoc(): void {
		this.customDocs.push('')
	}

	selectDoc(repo: string): void {
		if (this.selectedDocs.has(repo)) {
			this.selectedDocs.delete(repo);
		} else {
			this.selectedDocs.add(repo);
		}
	}

	handleInputChange(event: any, index: number): void {
		const value = event?.target?.value || '';
		this.customDocsValues[index] = value;
	}

	async submit(): Promise<void> {
		if (!this.canProceed || this.loading) return;
		this.loading = true;
		this.cdRef.markForCheck();
		try {
			await this.onboarding.updateDetails({
				codingInterests: [...this.selectedDocs],
			});
			this.router.navigate(['/app/setup/experience']);
			this.loading = false;
			this.cdRef.markForCheck();
		} catch (error) {
			console.error(error);
			this.loading = false;
			this.cdRef.markForCheck();
		}
	}

}
