import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './admin.component.html',
  styles: [
    `
      :host {
				@apply w-full h-full max-h-full overflow-hidden;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {

}
