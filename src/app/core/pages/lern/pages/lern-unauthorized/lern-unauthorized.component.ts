import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-lern-unauthorized',
  templateUrl: './lern-unauthorized.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LernUnauthorizedComponent {

}
