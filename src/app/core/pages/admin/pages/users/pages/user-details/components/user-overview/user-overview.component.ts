import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from 'src/app/auth/models/user.model';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styles: [
    `
      :host {
				@apply block max-w-full overflow-x-auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserOverviewComponent {

	@Input() user: User | undefined;

	getSubscriptionStatus(user: User) {
		const sub = user.subscriptions?.find(s => ['active', 'trialing'].includes(s.status));
		if (!sub) return 'Inactive';

		const now = new Date().getTime();
		const start = sub.current_period_start.toDate().getTime();
		const end = sub.current_period_end.toDate().getTime();
		const isActive = now >= start && now <= end;

		if (!isActive) return 'Inactive';

		return sub.status[0].toUpperCase() + sub.status.slice(1);
	}

	getRevenue(inEur: number, outUsd: number): number {
		return inEur - (outUsd * 0.95);
	}

}
