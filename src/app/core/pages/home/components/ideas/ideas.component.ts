import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ideas',
  templateUrl: './ideas.component.html',
  styles: [
    `
      :host {
        @apply block h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeasComponent {

}
