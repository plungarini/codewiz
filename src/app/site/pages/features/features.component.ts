import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styles: [
    `
      :host {
        @apply block relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) {
		this.meta.update({
			title: 'CodeWiz: Unveiling Next-Gen AI Features Every Developer Dreamed Of',
			description: 'Dive into CodeWiz\'s revolutionary features! Instant answers, real-time guidance, and quizzes, all powered by cutting-edge AI. Forget waiting on forums; your on-demand coding guru is here. Explore now and code with newfound confidence.'
		})
	}

}
