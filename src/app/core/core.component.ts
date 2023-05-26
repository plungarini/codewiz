import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './core.component.html',
  styles: [
    `
      :host {
				max-width: 100vw;

        @apply flex flex-row h-full overflow-hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent {

}
