import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  selector: 'app-lern-unauthorized',
  templateUrl: './lern-unauthorized.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LernUnauthorizedComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({ title: 'CodeWiz | WizLern - Not Authorized' });
	}

}
