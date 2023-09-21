import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptComponent {

}
