import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) { 
		this.meta.update({
			title: 'Unlock Your Coding Superpowers: CodeWiz Pricing Plans',
			description: 'Discover our enchanting pricing options and supercharge your coding journey with CodeWiz. Choose the perfect plan to become a coding wizard. Don\'t miss out on the magic!'
		})
	}

}
