import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
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
