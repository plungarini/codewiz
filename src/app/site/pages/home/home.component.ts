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

}
