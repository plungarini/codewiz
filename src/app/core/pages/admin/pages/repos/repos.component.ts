import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './repos.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposComponent {

}
