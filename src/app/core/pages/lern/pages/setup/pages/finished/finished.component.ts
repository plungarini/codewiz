import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-finished',
  templateUrl: './finished.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishedComponent implements OnDestroy {


	private _lernSub: Subscription;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private lern: LernService,
	) {
		const id = this.route.snapshot.parent?.params['id'];
		this._lernSub = this.lern.getCourseRequest(id).subscribe((c) => {
			if (!c?.repo) {
				this.router.navigate(['/app/lern/setup/new/hub']);
				return;
			}

			if (!c?.topic || !c.topic?.query || (c.topic.pages.length <= 0)) {
				this.router.navigate(['/app/lern/setup', id ,'search']);
				return;
			}

			if (!c.preferences) {
				this.router.navigate(['/app/lern/setup', id ,'preferences']);
			}
		});
		if (!id || id === 'new') {
			this.router.navigate(['/app/lern/setup/new/hub']);
		}
	}

	ngOnDestroy(): void {
		this._lernSub.unsubscribe();
	}

}
