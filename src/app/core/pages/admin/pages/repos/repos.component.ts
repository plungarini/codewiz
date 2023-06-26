import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './repos.component.html',
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposComponent {

}
