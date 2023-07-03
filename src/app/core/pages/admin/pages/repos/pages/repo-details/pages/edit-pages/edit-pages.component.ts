import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './edit-pages.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPagesComponent {

	repoId: string;

	constructor(
		private route: ActivatedRoute,
	) { 
		this.repoId = this.route.snapshot.params['id'];
	}

}
