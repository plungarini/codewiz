import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ph-banner',
  templateUrl: './ph-banner.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhBannerComponent {

}
