import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({ title: 'CodeWiz | WizLern - Lern Not Found' })
	}

}
