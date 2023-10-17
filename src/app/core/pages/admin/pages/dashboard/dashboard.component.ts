import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        @apply block w-full h-full max-h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

}
