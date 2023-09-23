import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Repo } from 'src/app/shared/models/repo.model';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styles: [
    `
      :host {
        @apply mt-12 mb-8 h-full max-w-3xl mx-auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntroComponent {

	selectedRepo: Repo | undefined;
	loading = false;
	
	private repoId: string | undefined;

	constructor(
		private lern: LernService,
		private router: Router,
		private route: ActivatedRoute,
		private cdRef: ChangeDetectorRef,
	) {
		this.repoId = this.route.parent?.snapshot.params['id'];
		if (this.repoId !== 'new') {
			this.router.navigate(['/app/lern/setup', this.repoId, 'search']);
		} else {
			this.cdRef.markForCheck();
		}
	}

	selectRepo(repo: Repo) {
		this.selectedRepo = repo;
	}

	async submit() {
		const repo = this.selectedRepo?.id;
		if (!repo) return;

		this.loading = true;
		this.cdRef.markForCheck();

		const data = await this.lern.createNewCourse(repo);
		
		if (data.url) {
			this.router.navigate([data.url]);
		}

		this.loading = false;
		this.cdRef.markForCheck();
	}

}
