import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './core.component.html',
  styles: [
    `
      :host {
				max-width: 100vw;
				max-height: 100vh;

        @apply flex flex-col md:flex-row h-full overflow-hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent {

}
