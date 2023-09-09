import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        @apply block w-full max-h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({
			title: 'CodeWiz | Admin - Dashboard',
		});
	}

}
