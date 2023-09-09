import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

@Component({
	selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

	constructor(
		private meta: PersonalMetaTagsService,
	) { 
		this.meta.update({
			title: 'CodeWiz | Instant AI-Powered Coding Solutions – Faster than StackOverflow',
			description: 'Meet CodeWiz – your AI coding companion. Dive into real-time chats, unravel coding mysteries faster than you can type "StackOverflow", and code with confidence. Embrace the future of coding assistance today!'
		})
	}

}
