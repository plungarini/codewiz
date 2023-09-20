import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-loader',
  templateUrl: './loader.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {

}
