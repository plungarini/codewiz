import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UsersService } from 'src/app/auth/services/users.service';

@Component({
  templateUrl: './home.component.html',
  styles: [
    `
      :host {
        @apply block w-full sm:max-h-full relative;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

	user$ = this.usersService.fireUser$;

	constructor(
		private usersService: UsersService,
	) { }

	getName(name?: string | null): string {
		return name?.split(' ')?.at(0) || 'fella';
	}

}
