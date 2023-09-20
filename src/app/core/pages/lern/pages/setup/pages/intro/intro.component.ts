import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Repo } from 'src/app/shared/models/repo.model';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styles: [
    `
      :host {
        @apply mt-12 mb-8 h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntroComponent {

	selectedRepo: Repo | undefined;
	loading = false;

	constructor(
		private lern: LernService,
		private router: Router,
		private cdRef: ChangeDetectorRef,
	) { }

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
