import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Embedding } from '../../models/embedding.model';

@Component({
  selector: 'app-repo-pages',
  templateUrl: './repo-pages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoPagesComponent {

	@Input('embeddings') embeddings$: Observable<Embedding[]> = of([]);

}
