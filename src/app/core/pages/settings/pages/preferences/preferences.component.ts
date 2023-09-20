import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './preferences.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {

}
