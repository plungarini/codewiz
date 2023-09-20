import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Repo } from '../../../../../../../../../shared/models/repo.model';

@Component({
	selector: 'app-repo-preview',
  templateUrl: './repo-preview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoPreviewComponent {
	@Input('repo') repo$: Observable<Repo | undefined> = of(undefined);
}
