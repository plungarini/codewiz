import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full sm:h-screen sm:max-h-full relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent {

}
