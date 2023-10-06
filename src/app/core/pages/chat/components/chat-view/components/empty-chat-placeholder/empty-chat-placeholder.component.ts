import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Repo } from 'src/app/shared/models/repo.model';
import { UserRepoService } from '../../../../services/user-repo.service';
import { ChatOnboardingService } from './services/chat-onboarding.service';

@Component({
  selector: 'app-empty-chat-placeholder',
  templateUrl: './empty-chat-placeholder.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyChatPlaceholderComponent implements OnDestroy {

	@Input() repoId: string | undefined;

	repos$ = this.repos.getAllSupportedDocs();

	hideOnboarding = new FormControl<boolean>(false, { nonNullable: true });
	showOnboarding = false;

	showStepOne = false;
	showStepTwo = false;

	private isFirstLoad = false;

	private _preferencesSub: Subscription;
	private _stepOneSub: Subscription;

	constructor(
		private repos: UserRepoService,
		private onboarding: ChatOnboardingService,
		private cdRef: ChangeDetectorRef,
	) {
		this._preferencesSub = this.onboarding.getOnboardingPreference()
			.subscribe((res) => {
				this.hideOnboarding.patchValue(!!res, { emitEvent: false });

				if (!this.isFirstLoad) {
					this.isFirstLoad = true;
					this.showOnboarding = !res;

					if (this.showOnboarding) {
						setTimeout(() => {
							this.showStepOne = true;
							this.cdRef.markForCheck();
						}, 100);
					}
				}
				this.cdRef.markForCheck();
			});
		this._stepOneSub = this.hideOnboarding.valueChanges
			.subscribe((v) => { this.save(v) });
	}

	ngOnDestroy(): void {
		this._preferencesSub.unsubscribe();
		this._stepOneSub.unsubscribe();
	}

	close(step: 'one' | 'two') {
		if (step === 'one') {
			this.showStepOne = false;
			this.showStepTwo = true;
		} else {
			this.showStepOne = false;
			this.showStepTwo = false;
		}
		this.cdRef.markForCheck();
	}

	async save(value: boolean) {
		await this.onboarding.setOnboardingPreference(value);
	}

	getSelectedRepo(repos: Repo[] | null): Repo | undefined {
		return repos?.filter(r => r?.id === this.repoId)[0];
	}

}
