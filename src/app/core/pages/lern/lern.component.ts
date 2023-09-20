import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-lern',
  templateUrl: './lern.component.html',
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LernComponent {

}
