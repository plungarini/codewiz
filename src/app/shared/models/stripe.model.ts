export type StripeProduct = {
	id: string;
	name: string;
	active: boolean;
	description?: string;
	images: string[];
	metadata: {
		firebaseRole?: string;
		maxPromptCountMonth?: string;
	};
	role?: string;
	tax_code: string;
	prices?: StripeProductPrice[];
}

export type StripeProductPrice = {
  type: string;
  active: boolean;
  tiers: any;
  recurring: {
		interval: string;
		usage_type: string;
		aggregate_usage: any;
		trial_period_days: any;
		interval_count: number;
	};
  billing_scheme: string;
  transform_quantity: any;
  metadata: any;
  interval: string;
  unit_amount: number;
  tax_behavior: string;
  product: string;
  trial_period_days: any;
  currency: string;
  interval_count: number;
  tiers_mode: any;
  description: any;
	id: string;
}
