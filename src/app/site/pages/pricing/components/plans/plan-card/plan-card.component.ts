import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { StripeSubscription } from 'src/app/auth/models/subscription.model';
import { StripeProduct } from 'src/app/shared/models/stripe.model';
import { CheckoutService } from '../../../services/checkout.service';

type PaymentLinks = {
	monthly: string;
	yearly: string;
}

@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.component.html',
  styles: [
    `
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanCardComponent {

	@Input() theme: 'dark' | 'light' = 'light';
	@Input() product: StripeProduct | undefined
	@Input() subscriptions: StripeSubscription[] | undefined = [];
	@Input() timeframe: 'monthly' | 'yearly' | null = 'yearly';

	loading = false;

	constructor(
		private checkoutService: CheckoutService,
		private cdRef: ChangeDetectorRef,
		private router: Router,
	) { }

	get hasCurrentSubscription(): boolean {
		if (!this.subscriptions?.at(0) || !this.product) return false;
		const subPriceId = this.subscriptions?.at(0)?.items.at(0)?.price.id;
		const currentPriceId = this.timeframe === 'monthly' ?
			this.product?.prices?.find((p) => p.recurring.interval === 'month')?.id :
			this.product?.prices?.find((p) => p.recurring.interval === 'year')?.id;
		return subPriceId === currentPriceId;
	}

	async buyNow() {
		if (this.loading) return;

		/* TODO - Remove when Master plan added */
		if (this.product?.role?.includes('master')) return;

		if (this.hasCurrentSubscription) {
			this.router.navigate(['/app']);
			return;
		}

		this.loading = true;
		this.cdRef.markForCheck();
		
		try {
			const priceTimeframe = this.timeframe === 'monthly' ? 'month' : 'year';
			const priceId = this.product?.prices?.find((p) => p.recurring.interval === priceTimeframe)?.id;
			if (!priceId) {
				this.loading = false;
				this.cdRef.markForCheck();
				return;
			};
			const url = await this.checkoutService.checkout(priceId);
			this.loading = false;
			this.cdRef.markForCheck();
			window.open(url, '_self');
		} catch (err) {
			console.error(err);
			this.loading = false;
			this.cdRef.markForCheck();
		}
	}

	getNormedName(): string {
		return this.product?.name?.replace('Plan', '').trim() || '';
	}

	getProdDescription(): string {
		return this.product?.description?.trim() || '';
	}

	getTotalPrice(): number {
		const monthly = this.product?.prices?.find((p) => p.recurring.interval === 'month');
		const yearly = this.product?.prices?.find((p) => p.recurring.interval === 'year');
		const price = this.timeframe === 'monthly' ? monthly : yearly;
		if (!price) return 0;
		const unit_amount = price?.unit_amount;
		if (!unit_amount) return 0;
		return unit_amount ? (unit_amount / 100) : 0;		
	}

	getProdCurrency(): string {
		const monthly = this.product?.prices?.find((p) => p.recurring.interval === 'month');
		const yearly = this.product?.prices?.find((p) => p.recurring.interval === 'year');
		const price = this.timeframe === 'monthly' ? monthly : yearly;
		return price?.currency?.toUpperCase() || 'EUR';
	}

	getPricePerQuestionMonthly(): number {
		const monthly = this.product?.prices?.find((p) => p.recurring.interval === 'month');
		const unit_amount = monthly?.unit_amount || 0;
		const questions = parseInt(this.product?.metadata.maxPromptCountMonth || '0');
		return (this.product && unit_amount && questions) ? ((unit_amount / 100) / questions) : 0;
	}

	getPricePerQuestionYearly(): number {
		const yearly = this.product?.prices?.find((p) => p.recurring.interval === 'year');
		const unit_amount = yearly?.unit_amount || 0;
		const questions = parseInt(this.product?.metadata.maxPromptCountMonth || '0') * 12;
		return (this.product && unit_amount && questions) ? ((unit_amount / 100) / questions) : 0;
	}

	getAnnualySavingPerc(): number {
		const monthly = this.getPricePerQuestionMonthly();
		const yearly = this.getPricePerQuestionYearly();
		if (monthly === 0 || yearly === 0) return 0;
		const perc = ((yearly - monthly) / monthly) * 100;
		return Math.abs(Math.ceil(perc));
	}

}
