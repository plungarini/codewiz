import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

	showFeaturedIn = new Date() > new Date('2023-09-18T00:01:00-07:00');

}
