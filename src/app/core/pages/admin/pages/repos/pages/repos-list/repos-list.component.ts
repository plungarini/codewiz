import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './repos-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposListComponent {

}
