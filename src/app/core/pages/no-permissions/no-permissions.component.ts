import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  selector: 'app-no-permissions',
  templateUrl: './no-permissions.component.html',
  styles: [
    `
      :host {
        @apply block relative w-full h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoPermissionsComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({
			title: 'CodeWiz | You do not have access to this page'
		});
	}

}
