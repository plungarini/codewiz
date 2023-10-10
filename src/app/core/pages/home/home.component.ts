import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
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

	name$ = this.usersService.user$.pipe(
		switchMap((user) => {
			if (user?.name) return of(user.name);
			return this.usersService.fireUser$.pipe(
				map(fire => fire?.displayName)
			)
		})
	);

	constructor(
		private usersService: UsersService,
	) { }

	getName(name?: string | null): string {
		return name?.split(' ')?.at(0) ?? 'Little Wizard';
	}

}
