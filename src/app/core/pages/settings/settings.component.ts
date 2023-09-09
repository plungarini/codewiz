import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
	selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
    `
      :host {
        @apply w-full h-full sm:max-h-full sm:overflow-hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({
			title: 'CodeWiz | Settings'
		});
	}

}
