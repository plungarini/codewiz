import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './core.component.html',
  styles: [
    `
      :host {
        @apply flex flex-row justify-between h-full px-4;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent {

}
