import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './profile.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {

}
