import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styles: [
    `
      :host {
        @apply block;;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeComponent {

}
