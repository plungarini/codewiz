import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './repos.component.html',
  styles: [
    `
      :host {
        @apply block w-full max-h-full sm:overflow-y-auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposComponent {

}
