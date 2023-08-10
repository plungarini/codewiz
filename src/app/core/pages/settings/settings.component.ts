import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './settings.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {

}
