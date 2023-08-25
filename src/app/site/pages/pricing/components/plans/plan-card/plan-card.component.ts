import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StripeSubscription } from 'functions/src/models/subscription/subscription.model';
import { StripeProduct } from 'src/app/shared/models/stripe.model';

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
	@Input() product: {
		monthly: StripeProduct | undefined;
		yearly: StripeProduct | undefined;
	} | undefined;
	@Input() subscriptions: StripeSubscription[] | undefined = [];
	@Input() timeframe: 'monthly' | 'yearly' | null = 'yearly';

	get hasCurrentSubscription(): boolean {
		if (!this.subscriptions?.at(0) || !this.product) return false;
		const normedSubRole = this.subscriptions?.at(0)?.role?.replace('_annual', '');
		if (!normedSubRole) return false;
		return (normedSubRole) === (this.product?.monthly?.role);
	}

	getNormedName(): string {
		const prod = this.timeframe === 'monthly' ? this.product?.monthly : this.product?.yearly;
		return prod?.name?.replace('Annual', '').replace('Plan', '').trim() || '';
	}

	getProdDescription(): string {
		const prod = this.timeframe === 'monthly' ? this.product?.monthly : this.product?.yearly;
		return prod?.description || '';
	}

	getTotalPrice(): number {
		const prod = this.timeframe === 'monthly' ? this.product?.monthly : this.product?.yearly;
		const unit_amount = prod?.price?.unit_amount;
		return unit_amount ? (unit_amount / 100) : 0;		
	}

	getProdCurrency(): string {
		const prod = this.timeframe === 'monthly' ? this.product?.monthly : this.product?.yearly;
		return prod?.price?.currency?.toUpperCase() || 'EUR';
	}

	getPricePerQuestionMonthly(): number {
		const prod = this.product?.monthly;
		const unit_amount = prod?.price?.unit_amount || 0;
		const questions = parseInt(prod?.metadata.maxPromptCountMonth || '0');
		return (prod && unit_amount && questions) ? ((unit_amount / 100) / questions) : 0;
	}

	getPricePerQuestionYearly(): number {
		const prod = this.product?.yearly;
		const unit_amount = prod?.price?.unit_amount || 0;
		const questions = parseInt(prod?.metadata.maxPromptCountMonth || '0') * 12;
		return (prod && unit_amount && questions) ? ((unit_amount / 100) / questions) : 0;
	}

	getAnnualySavingPerc(): number {
		const monthly = this.getPricePerQuestionMonthly();
		const yearly = this.getPricePerQuestionYearly();
		if (monthly === 0 || yearly === 0) return 0;
		const perc = ((yearly - monthly) / monthly) * 100;
		return Math.abs(Math.ceil(perc));
	}

}
