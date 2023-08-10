import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './billing.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {

}
