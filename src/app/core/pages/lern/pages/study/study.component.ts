import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudyComponent {

}
