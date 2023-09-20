import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-onboard-navigation',
  templateUrl: './onboard-navigation.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardNavigationComponent {

	@Input() page: string = 'welcome';

}
