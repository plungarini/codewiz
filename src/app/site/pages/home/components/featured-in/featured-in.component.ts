import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-featured-in',
  templateUrl: './featured-in.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedInComponent {

}
