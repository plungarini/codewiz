import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PersonalMetaTagsService } from 'src/app/shared/services/personal-meta-tags.service';

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
export class SetupComponent implements OnDestroy {

	private _routerSub: Subscription;

	constructor(
		private router: Router,
		private meta: PersonalMetaTagsService,
	) {
		this._routerSub = this.router.events.subscribe(() => {
			const url = this.router.url;
			const search = /\/app\/lern\/.*\/search/;
			const preferences = /\/app\/lern\/.*\/preferences/;
			const finished = /\/app\/lern\/.*\/finish/;
			if (url.includes('/lern/setup/new/hub')) {
				this.meta.update({ title: 'CodeWiz | WizLern - Create a Lern' });
			} else if (search.test(url)) {
				this.meta.update({ title: 'CodeWiz | WizLern - Craft Your Learning' });
			} else if (preferences.test(url)) {
				this.meta.update({ title: 'CodeWiz | WizLern - Shape Your Course' });
			} else if (finished.test(url)) {
				this.meta.update({ title: 'CodeWiz | WizLern - Magic in Progress...' });
			}
		})
	}

	ngOnDestroy(): void {
		this._routerSub.unsubscribe();
	}

}
