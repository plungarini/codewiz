import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styles: [
    `
      :host {
        display: block;
				height: 100%;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatSidebarComponent {

}
