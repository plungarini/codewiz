import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-query-input',
  templateUrl: './query-input.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryInputComponent {

}
