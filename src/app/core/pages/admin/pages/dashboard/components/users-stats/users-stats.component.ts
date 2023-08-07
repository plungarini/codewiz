import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { UsersService } from 'src/app/auth/services/users.service';

@Component({
  selector: 'app-users-stats',
  templateUrl: './users-stats.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersStatsComponent {

	users$: Observable<User[]>;

	constructor(
		private usersService: UsersService,
	) {
		this.users$ = this.usersService.getAllWithSubscriptions();
	}

	getLastMonthUsers(users: User[]) {
		return users
			.filter(user => !!user.createdAt)
			.filter(user => (user.createdAt?.toDate() || new Date()) > new Date(new Date().setDate(new Date().getDate() - 30)))
			.length;
	}

	getTotalSubscribers(users: User[]) {
		return users
			.filter(user => (user.subscriptions?.length || 0) > 0)
			.length;
	}

	getLastMonthSubscribers(users: User[]) {
		return users
			.filter(user => !!user.subscriptions?.at(0)?.created)
			.filter(user => (user.subscriptions?.at(0)?.created?.toDate() || new Date()) > new Date(new Date().setDate(new Date().getDate() - 30)))
			.length;
	}

}
