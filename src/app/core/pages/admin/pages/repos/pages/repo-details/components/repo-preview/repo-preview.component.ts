import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectedDocs } from 'src/app/shared/models/select-docs.model';

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
	@Input('repo') repo$: Observable<SelectedDocs | undefined> = of(undefined);
}
