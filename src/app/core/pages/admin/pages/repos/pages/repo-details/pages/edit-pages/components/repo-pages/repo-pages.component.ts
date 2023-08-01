import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RepoPage } from '../../../../../../../../../../../shared/models/repo.model';

@Component({
  selector: 'app-repo-pages',
  templateUrl: './repo-pages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoPagesComponent {

	@Input('pages') pages$: Observable<RepoPage[]> = of([]);

	@Output('manualElaborate') manualElaborate = new EventEmitter<RepoPage>();

	manualElaborateClick(page: RepoPage) {
		this.manualElaborate.emit(page);
	}

}
