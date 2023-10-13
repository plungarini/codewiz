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

	getThisMonthUsers(users: User[]) {
		return users
			.filter(user => !!user.createdAt)
			.filter(user => (user.createdAt?.toDate() ?? new Date()) > this._getLastDayOfLastMonth())
			.length;
	}

	getTotalSubscribers(users: User[]) {
		return users
			.filter(user => (user.subscriptions?.length ?? 0) > 0)
			.length;
	}

	getThisMonthSubscribers(users: User[]) {
		return users
			.filter(user => !!user.subscriptions?.at(0)?.created)
			.filter(user => (user.subscriptions?.at(0)?.created?.toDate() ?? new Date()) > this._getLastDayOfLastMonth())
			.length;
	}

	private _getLastDayOfLastMonth() {
		let date = new Date();
		date.setDate(1);  // Set to the first day of the current month
		date.setDate(date.getDate() - 1);  // Subtract one day to go to the last day of the previous month

		return date;
	}

}
