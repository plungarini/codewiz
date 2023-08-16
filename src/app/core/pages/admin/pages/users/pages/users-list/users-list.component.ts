import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { UsersService } from 'src/app/auth/services/users.service';

type FilterOrSortConfig = {
	search: string;
	sort: {
		field: 'name' | 'in' | 'out' | 'joinDate';
		order: 'asc' | 'desc';
	};
}

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent {

	users$: Observable<User[]>;

	statsTimeframe: 'total' | 'current' = 'total';

	sortBy: FilterOrSortConfig['sort']['field'] = 'joinDate';
	order: FilterOrSortConfig['sort']['order'] = 'desc';

	loading = true;

	private defaultFilterOrSort: FilterOrSortConfig = {
		search: '',
		sort: {
			field: 'joinDate',
			order: 'desc',
		}
	};
	private onFilterOrSort$ = new BehaviorSubject(this.defaultFilterOrSort);

	constructor(
		private usersService: UsersService,
	) {
		this.users$ = this.onFilterOrSort$.asObservable().pipe(
			switchMap(sortBy => {
				this.loading = true;
				return this.usersService.getAllWithInvoices().pipe(
					map(users => {
						return users
							.map(user => {
								return this.calculateUserRevenue(user);
							})
					}),
					map(users => {
						this.loading = false;
						return this.filterOrSort(users, sortBy)
					}),
				);
			})
		)
	}

	calculateUserRevenue(user: User): User {
		let totalCost = 0;
		let currentTotalCost = 0;
		let totalPaid = 0;
		let currentTotalPaid = 0;

		const now = new Date();
		const month = now.getMonth();
		const dateId = `${month < 10 ? '0' : ''}${month}_${now.getFullYear()}`;

		user.usages?.forEach(usage => {
			usage.stats?.forEach(stat => {
				const totalQuestion = (stat.completion?.usedUSD || 0) + (stat.prompt?.usedUSD || 0);
				
				if (dateId === stat.id) currentTotalCost += totalQuestion;
				totalCost += totalQuestion;
			})
		});

		user.subscriptions?.forEach(subscription => {
			subscription.invoices?.forEach(invoice => {
				const paidAt = invoice?.status_transitions?.paid_at;
				if (!invoice || !invoice?.paid || !paidAt) return;

				const invoiceNow = new Date(paidAt * 1000);
				const invoiceMonth = invoiceNow.getMonth();
				const invoiceDateId = `${invoiceMonth < 10 ? '0' : ''}${invoiceMonth}_${invoiceNow.getFullYear()}`;

				if (dateId === invoiceDateId) currentTotalPaid += invoice.amount_paid
				totalPaid += invoice.amount_paid;
			})
		});
		
		const revenue: User['revenueDetails'] = {
			totalCost,
			totalCostThisMonth: currentTotalCost,
			totalPaid,
			paidThisMonth: currentTotalPaid,
		};

		return { ...user, revenueDetails: revenue };
	}

	trackBy(index: number, user: User) {
		return user.id || index;
	}

	onSort(sortBy: FilterOrSortConfig['sort']['field']) {
		this.order = this.sortBy === sortBy ? (this.order === 'desc' ? 'asc' : 'desc') : 'desc';
		this.sortBy = sortBy;
		this.onFilterOrSort$.next({
			...this.defaultFilterOrSort,
			sort: {
				field: this.sortBy,
				order: this.order,
			},
		});
	}

	private filterOrSort(users: User[], options: FilterOrSortConfig): User[] {
		const { search, sort } = options;
		const { field, order } = sort;

		const sortedUsers = users.sort((a, b) => {
			if (order === 'asc') {
				if (field === 'name') {
					return (a.name || '') > (b.name || '') ? 1 : -1;
				} else if (field === 'in') {
					if (this.statsTimeframe === 'total') {
						return (a.revenueDetails?.totalPaid || 0) > (b.revenueDetails?.totalPaid || 0) ? 1 : -1;
					} else {
						return (a.revenueDetails?.paidThisMonth || 0) > (b.revenueDetails?.paidThisMonth || 0) ? 1 : -1;
					}
				} else if (field === 'out') {
					if (this.statsTimeframe === 'total') {
						return (a.revenueDetails?.totalCost || 0) > (b.revenueDetails?.totalCost || 0) ? 1 : -1;
					} else {
						return (a.revenueDetails?.totalCostThisMonth || 0) > (b.revenueDetails?.totalCostThisMonth || 0) ? 1 : -1;
					}
				} else if (field === 'joinDate') {
					return (a.createdAt?.toDate().getTime() || 0) > (b.createdAt?.toDate().getTime() || 0) ? 1 : -1;
				} else {
					return 0;
				}
			} else {
				if (field === 'name') {
					return (a.name || '') > (b.name || '') ? -1 : 1;
				} else if (field === 'in') {
					if (this.statsTimeframe === 'total') {
						return (a.revenueDetails?.totalPaid || 0) > (b.revenueDetails?.totalPaid || 0) ? -1 : 1;
					} else {
						return (a.revenueDetails?.paidThisMonth || 0) > (b.revenueDetails?.paidThisMonth || 0) ? -1 : 1;
					}
				} else if (field === 'out') {
					if (this.statsTimeframe === 'total') {
						return (a.revenueDetails?.totalCost || 0) > (b.revenueDetails?.totalCost || 0) ? -1 : 1;
					} else {
						return (a.revenueDetails?.totalCostThisMonth || 0) > (b.revenueDetails?.totalCostThisMonth || 0) ? -1 : 1;
					}
				} else if (field === 'joinDate') {
					return (a.createdAt?.toDate().getTime() || 0) > (b.createdAt?.toDate().getTime() || 0) ? -1 : 1;
				} else {
					return 0;
				}
			}
		});

		const filteredUsers = sortedUsers.filter(user => {
			if (!search) return true;
			const normVal = search.toLowerCase().split(' ');
			return normVal.every(val => {
				return (user.name || '').toLowerCase().includes(val) ||
					(user.email || '').toLowerCase().includes(val);
			})
		});

		return filteredUsers;
	}

}
