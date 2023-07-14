import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RepoPage } from '../../../../models/repo.model';

@Component({
  selector: 'app-repo-pages',
  templateUrl: './repo-pages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoPagesComponent {

	@Input('pages') pages$: Observable<RepoPage[]> = of([]);

}
