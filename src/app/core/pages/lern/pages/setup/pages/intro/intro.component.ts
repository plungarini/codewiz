import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Repo } from 'src/app/shared/models/repo.model';
import { LernService } from '../../../../services/lern.service';
import { CanGenerateLernService } from './services/can-generate-lern.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styles: [
    `
      :host {
        @apply mt-12 h-full max-w-3xl mx-auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntroComponent implements OnDestroy {

	selectedRepo: Repo | undefined;
	loading = false;

	canGenerateLern = false;
	loadedCanGenerate = false;
	
	private _repoId: string | undefined;
	private _canGenerateSub: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private cdRef: ChangeDetectorRef,
		private lern: LernService,
		private canGenerate: CanGenerateLernService,
	) {
		this._repoId = this.route.parent?.snapshot.params['id'];
		if (this._repoId !== 'new') {
			this.router.navigate(['/app/lern/setup', this._repoId, 'search']);
		} else {
			this.cdRef.markForCheck();
		}

		this._canGenerateSub = this.canGenerate.getCanGenerateLern()
			.subscribe((can) => {
				this.canGenerateLern = can;
				if (!this.loadedCanGenerate) this.loadedCanGenerate = true;
				this.cdRef.markForCheck();
			})
	}

	ngOnDestroy(): void {
		this._canGenerateSub.unsubscribe();
	}

	selectRepo(repo: Repo) {
		this.selectedRepo = repo;
	}

	async submit() {
		const repo = this.selectedRepo?.id;
		if (!repo) return;

		this.loading = true;
		this.cdRef.markForCheck();


		try {
			if (!this.canGenerate) throw new Error('Unable to create a new Lern, not enough credits.');
			const data = await this.lern.createNewCourse(repo);
			if (data.url) {
				this.router.navigate([data.url]);
			}
		} catch (err) {
			console.error(err);
		}

		this.loading = false;
		this.cdRef.markForCheck();
	}

}
