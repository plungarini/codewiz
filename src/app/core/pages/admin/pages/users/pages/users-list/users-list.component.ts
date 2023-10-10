import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, map, Subscription, switchMap } from 'rxjs';
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
        @apply block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnDestroy {

	searchControl = new FormControl('');

	statsTimeframe: 'total' | 'current' = 'total';
	sortBy: FilterOrSortConfig['sort']['field'] = 'joinDate';
	order: FilterOrSortConfig['sort']['order'] = 'desc';

	loading = true;

	filteredUsers: User[] = [];
	private users: User[] = [];
	
	private defaultFilterOrSort: FilterOrSortConfig = {
		search: '',
		sort: {
			field: 'joinDate',
			order: 'desc',
		}
	};
	private onFilterOrSort$ = new BehaviorSubject(this.defaultFilterOrSort);

	private usersSub: Subscription;
	private searchSub: Subscription;

	constructor(
		private usersService: UsersService,
		private cdRef: ChangeDetectorRef,
	) {
		this.usersSub = this.onFilterOrSort$.asObservable().pipe(
			switchMap(sortBy => {
				this.loading = true;
				const easySort = ['name', 'joinDate'].includes(sortBy.sort.field);

				if (easySort) {
					return this.usersService.getAll().pipe(
						map(users => {
							this.loading = false;
							this.users = users;
							return this.filterOrSort(users, sortBy)
						}),
					);
				}

				return this.usersService.getAllWithInvoices().pipe(
					map(users => {
						return users
							.map(user => {
								return this.calculateUserRevenue(user);
							})
					}),
					map(users => {
						this.loading = false;
						this.users = users;
						return this.filterOrSort(users, sortBy)
					}),
				);
			})
		).subscribe(users => {
			this.filteredUsers = users;
			this.cdRef.detectChanges();
		});

		this.searchSub = this.searchControl.valueChanges.subscribe(search => {
			this.filteredUsers = this.filterOrSort(this.users, { ...this.defaultFilterOrSort, search: search ?? '' });
			this.cdRef.detectChanges();
		});
	}

	ngOnDestroy(): void {
		this.usersSub.unsubscribe();
		this.searchSub.unsubscribe();
	}

	trackBy(index: number, user: User) {
		return user.id ?? index;
	}

	onSort(sortBy: FilterOrSortConfig['sort']['field']) {
		const orderToggle = this.order === 'desc' ? 'asc' : 'desc';
		this.order = this.sortBy === sortBy ? orderToggle : 'desc';
		this.sortBy = sortBy;
		this.onFilterOrSort$.next({
			...this.defaultFilterOrSort,
			sort: {
				field: this.sortBy,
				order: this.order,
			},
		});
	}

	private calculateUserRevenue(user: User): User {
		let totalCost = 0;
		let currentTotalCost = 0;
		let totalPaid = 0;
		let currentTotalPaid = 0;

		const now = new Date();
		const month = now.getMonth();
		const dateId = `${month < 10 ? '0' : ''}${month}_${now.getFullYear()}`;

		user.usages?.forEach(usage => {
			usage.stats?.forEach(stat => {
				const totalQuestion = (stat.completion?.usedUSD ?? 0) + (stat.prompt?.usedUSD ?? 0);
				
				if (dateId === stat.id) currentTotalCost += totalQuestion;
				totalCost += totalQuestion;
			})
		});

		user.subscriptions?.forEach(subscription => {
			subscription.invoices?.forEach(invoice => {
				const paidAt = invoice?.status_transitions?.paid_at;
				if (!invoice?.paid || !paidAt) return;

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

	private filterOrSort(users: User[], options: FilterOrSortConfig): User[] {
		const { search, sort } = options;
		const { field, order } = sort;
	
		const sortedUsers = [...users].sort((a, b) => {	
			const compareValues = (aValue: any, bValue: any) => {
				if (order === 'asc') {
					return aValue > bValue ? 1 : -1;
				} else {
					return aValue > bValue ? -1 : 1;
				}
			};
	
			return compareValues(this.getSortValue(a, field), this.getSortValue(b, field));
		});
	
		const filteredUsers = sortedUsers.filter(user => {
			if (!search) return true;
			const normVal = search.toLowerCase().split(' ');
			return normVal.every(val => {
				return (user.name ?? '').toLowerCase().includes(val) ??
					(user.email ?? '').toLowerCase().includes(val);
			})
		});
	
		return filteredUsers;
	}

	private getSortValue(user: User, field: 'name' | 'in' | 'out' | 'joinDate') {
		if (field === 'name') {
			return user.name ?? '';
		} else if (field === 'in') {
			return this.statsTimeframe === 'total' ? user.revenueDetails?.totalPaid ?? 0 : user.revenueDetails?.paidThisMonth ?? 0;
		} else if (field === 'out') {
			return this.statsTimeframe === 'total' ? user.revenueDetails?.totalCost ?? 0 : user.revenueDetails?.totalCostThisMonth ?? 0;
		} else if (field === 'joinDate') {
			return user.createdAt?.toDate().getTime() ?? 0;
		} else {
			return 0;
		}
	};

}
