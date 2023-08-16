import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: [
    `
      :host {
        display: block;
				height: 100%;
				width: 100%;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {

	constructor(
		private authService: AuthenticationService,
	) { }

	signout(): void {
		this.authService.signOut();
	}

}
