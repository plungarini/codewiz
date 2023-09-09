import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalService } from 'src/app/shared/services/legal.service';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalComponent {

	legal$ = this.legalService.getDocuments();

	constructor(
		private legalService: LegalService,
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({
			title: 'CodeWiz | Settings - Legal Documents',
		});
	}

}
