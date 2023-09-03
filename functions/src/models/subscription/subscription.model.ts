import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

export interface StripeSubscription {
	ended_at: Timestamp;
  stripeLink: string;
  product: DocumentReference;
  cancel_at_period_end: boolean;
  canceled_at: Timestamp;
  trial_start: Timestamp;
  trial_end: Timestamp;
  items: Item[];
  quantity: number;
  current_period_start: Timestamp;
  cancel_at: Timestamp;
  metadata: Record<string, any>;
  created: Timestamp;
  status: string;
  current_period_end: Timestamp;
  role: string;
  price: DocumentReference;
  id: string
}

interface Item {
  quantity: number;
  tax_rates: any[];
  subscription: string;
  billing_thresholds: Record<string, any>;
  object: string;
  metadata: Record<string, any>;
  id: string;
  plan: Plan;
  created: number;
  price: Price
}

interface Plan {
  object: string;
  tiers_mode: Record<string, any>;
  usage_type: string;
  metadata: Record<string, any>;
  amount: number;
  currency: string;
  aggregate_usage: Record<string, any>;
  transform_usage: Record<string, any>;
  nickname: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  product: string;
  interval_count: number;
  interval: string;
  trial_period_days: Record<string, any>;
  amount_decimal: string;
  id: string;
  livemode: boolean
}

interface Price {
  custom_unit_amount: Record<string, any>;
  tiers_mode: Record<string, any>;
  created: number;
  nickname: string;
  lookup_key: Record<string, any>;
  billing_scheme: string;
  object: string;
  type: string;
  recurring: Recurring;
  unit_amount: number;
  metadata: Record<string, any>;
  product: Product2;
  tax_behavior: string;
  currency: string;
  active: boolean;
  unit_amount_decimal: string;
  id: string;
  transform_quantity: Record<string, any>;
  livemode: boolean
}

interface Recurring {
  interval_count: number;
  interval: string;
  usage_type: string;
  aggregate_usage: Record<string, any>;
  trial_period_days: any
}

interface Product2 {
  description: Record<string, any>;
  package_dimensions: Record<string, any>;
  livemode: boolean;
  tax_code: string;
  id: string;
  unit_label: Record<string, any>;
  attributes: any[];
  name: string;
  default_price: string;
  active: boolean;
  updated: number;
  created: number;
  shippable: Record<string, any>;
  metadata: Metadata4;
  statement_descriptor: Record<string, any>;
  url: Record<string, any>;
  type: string;
  images: any[];
  object: string
}

interface Metadata4 {
  firebaseRole: string
}

