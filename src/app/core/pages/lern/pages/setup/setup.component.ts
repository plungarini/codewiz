import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LernService } from '../../services/lern.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full sm:h-screen sm:max-h-full relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent {

	private courseId: string;

	constructor(
		private lern: LernService,
		private route: ActivatedRoute,
	) {
		this.courseId = this.route.snapshot.params['id'] || 'new';
	}

	async searchDocs(query: string) {
		const res = await this.lern.searchDocs(query);
		console.log(res);
	}

}
