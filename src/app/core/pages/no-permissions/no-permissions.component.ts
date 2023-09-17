import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-permissions',
  templateUrl: './no-permissions.component.html',
  styles: [
    `
      :host {
        @apply block relative w-full h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoPermissionsComponent {

}
