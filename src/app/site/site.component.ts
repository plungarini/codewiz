import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteComponent {

}
