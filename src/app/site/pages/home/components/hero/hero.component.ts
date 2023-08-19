import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-hero',
  templateUrl: './hero.component.html',
	styles: [
    `
			:host {
				@pply block;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {

}
