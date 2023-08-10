import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
    `
      :host {
        @apply w-full h-full max-h-full overflow-hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {

}
