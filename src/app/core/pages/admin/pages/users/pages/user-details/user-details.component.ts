import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Subscription, switchMap } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { UsersService } from 'src/app/auth/services/users.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent implements OnDestroy {

	user: User | undefined;

	private id: string = '';
	private userSub: Subscription;

	constructor(
		private route: ActivatedRoute,
		private usersService: UsersService,
		private cdRef: ChangeDetectorRef,
	) {
		this.userSub = this.route.params.pipe(
			switchMap(params => {
				this.id = params['id'];
				return this.usersService.getWithInvoice(this.id);
			}),
			map(user => this.calculateUserRevenue(user))
		).subscribe((user) => {
			this.user = user;
			this.cdRef.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.userSub.unsubscribe();
	}

private calculateUserRevenue(user?: User): User | undefined {
	if (!user) return user;

	const now = new Date();
	const month = now.getMonth();
	const dateId = `${month < 10 ? '0' : ''}${month}_${now.getFullYear()}`;

	let totalCost = 0;
	let currentTotalCost = 0;
	let totalPaid = 0;
	let currentTotalPaid = 0;

	user?.usages?.forEach(usage => {
		usage?.stats?.forEach(stat => {
			const totalQuestion = (stat?.completion?.usedUSD ?? 0) + (stat?.prompt?.usedUSD ?? 0);

			if (dateId === stat?.id) currentTotalCost += totalQuestion;
			totalCost += totalQuestion;
		})
	});

	user?.subscriptions?.forEach(subscription => {
		subscription?.invoices?.forEach(invoice => {
			const paidAt = invoice?.status_transitions?.paid_at;
			if (!invoice?.paid || !paidAt) return;

			const invoiceNow = new Date(paidAt * 1000);
			const invoiceMonth = invoiceNow.getMonth();
			const invoiceDateId = `${invoiceMonth < 10 ? '0' : ''}${invoiceMonth}_${invoiceNow.getFullYear()}`;

			if (dateId === invoiceDateId) currentTotalPaid += (invoice.amount_paid / 100)
			totalPaid += (invoice.amount_paid / 100);
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

}
