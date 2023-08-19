import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-features',
  templateUrl: './features.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesComponent {

}
