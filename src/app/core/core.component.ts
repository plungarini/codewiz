import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './core.component.html',
  styles: [
    `
      :host {
				max-width: 100vw;

        @apply flex flex-col md:flex-row h-full sm:max-h-screen sm:overflow-hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent {

}
