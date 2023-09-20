import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-hero',
  templateUrl: './hero.component.html',
	styles: [
    `
			:host {
				@apply block;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {

	showPhBanner = new Date() < new Date('2023-09-19T00:01:00-07:00');

}
