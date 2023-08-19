import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cta',
  templateUrl: './cta.component.html',
  styles: [
    `
      :host {
        @apply block relative z-10;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CtaComponent {

}
