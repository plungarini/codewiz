import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './repo-details.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoDetailsComponent {

}
