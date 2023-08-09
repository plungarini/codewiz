import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styles: [
    `
      :host {
        @apply block relative overflow-visible;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {

	@Input() name?: string;

}
