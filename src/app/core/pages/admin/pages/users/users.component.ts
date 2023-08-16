import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {

}
