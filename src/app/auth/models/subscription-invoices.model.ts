type StripeMetadata = {};

type StripeLines = {
  object: string;
  total_count: number;
  has_more: boolean;
  url: string;
  data: StripeLineItem[];
};

type StripeLineItem = {
  proration: boolean;
  tax_amounts: any[];
  object: string;
  tax_rates: any[];
  discountable: boolean;
  id: string;
  subscription: string;
  proration_details: StripeProrationDetails;
  amount_excluding_tax: number;
  plan: StripePlan;
  discount_amounts: StripeDiscountAmount[];
  description: string;
  metadata: StripeMetadata;
  price: StripePrice;
  discounts: any[];
  currency: string;
  subscription_item: string;
  quantity: number;
  unit_amount_excluding_tax: string;
  livemode: boolean;
  amount: number;
  type: string;
  period: StripePeriod;
};

type StripeProrationDetails = {
  credited_items: any;
};

type StripePlan = {
  id: string;
  transform_usage: any;
  aggregate_usage: any;
  livemode: boolean;
  usage_type: string;
  active: boolean;
  interval: string;
  tiers_mode: any;
  nickname: string;
  interval_count: number;
  object: string;
  amount_decimal: string;
  product: string;
  created: number;
  currency: string;
  billing_scheme: string;
  metadata: StripeMetadata;
  amount: number;
  trial_period_days: any;
};

type StripeDiscountAmount = {
  discount: string;
  amount: number;
};

type StripePrice = {
  transform_quantity: any;
  custom_unit_amount: any;
  metadata: StripeMetadata;
  currency: string;
  active: boolean;
  id: string;
  tiers_mode: any;
  lookup_key: any;
  type: string;
  tax_behavior: string;
  created: number;
  product: string;
  unit_amount: number;
  recurring: StripeRecurring;
  livemode: boolean;
  object: string;
  nickname: string;
  billing_scheme: string;
  unit_amount_decimal: string;
};

type StripeRecurring = {
  interval: string;
  trial_period_days: any;
  interval_count: number;
  usage_type: string;
  aggregate_usage: any;
};

type StripePeriod = {
  end: number;
  start: number;
};

type StripeAutomaticTax = {
  enabled: boolean;
  status: any;
};

type StripeDiscount = {
  object: string;
  id: string;
  subscription: string;
  promotion_code: string;
  invoice: any;
  checkout_session: any;
  customer: string;
  end: any;
  start: number;
  coupon: StripeCoupon;
  invoice_item: any;
};

type StripeCoupon = {
  max_redemptions: any;
  id: string;
  livemode: boolean;
  percent_off: number;
  times_redeemed: number;
  amount_off: any;
  duration: string;
  metadata: StripeMetadata;
  object: string;
  name: string;
  currency: any;
  created: number;
  redeem_by: any;
  valid: boolean;
  duration_in_months: any;
};

type StripeStatusTransitions = {
  voided_at: any;
  marked_uncollectible_at: any;
  finalized_at: number;
  paid_at: number;
};

type StripePaymentSettings = {
  default_mandate: any;
  payment_method_options: any;
  payment_method_types: any;
};

export type StripeSubscriptionInvoice = {
  default_tax_rates: any[];
  metadata: StripeMetadata;
  hosted_invoice_url: string;
  lines: StripeLines;
  amount_due: number;
  attempt_count: number;
  transfer_data: any;
  payment_intent: any;
  amount_paid: number;
  period_start: number;
  customer: string;
  application: any;
  starting_balance: number;
  description: any;
  rendering_options: any;
  tax: any;
  default_payment_method: any;
  charge: any;
  invoice_pdf: string;
  subscription_details: { metadata: StripeMetadata };
  automatic_tax: StripeAutomaticTax;
  number: string;
  status: string;
  receipt_number: any;
  latest_revision: any;
  collection_method: string;
  account_country: string;
  on_behalf_of: any;
  from_invoice: any;
  customer_tax_ids: any[];
  last_finalization_error: any;
  total: number;
  effective_at: number;
  subscription: string;
  paid: boolean;
  total_discount_amounts: StripeDiscountAmount[];
  customer_phone: any;
  paid_out_of_band: boolean;
  id: string;
  next_payment_attempt: any;
  amount_shipping: number;
  attempted: boolean;
  livemode: boolean;
  application_fee_amount: any;
  discounts: string[];
  shipping_cost: any;
  discount: StripeDiscount;
  customer_tax_exempt: string;
  amount_remaining: number;
  subtotal_excluding_tax: number;
  period_end: number;
  post_payment_credit_notes_amount: number;
  customer_shipping: any;
  total_tax_amounts: any[];
  status_transitions: StripeStatusTransitions;
  account_tax_ids: any;
  custom_fields: any;
  pre_payment_credit_notes_amount: number;
  customer_name: any;
  shipping_details: any;
  billing_reason: string;
  created: number;
  subtotal: number;
  auto_advance: boolean;
  statement_descriptor: any;
  account_name: string;
  test_clock: any;
  webhooks_delivered_at: number;
  default_source: any;
  due_date: any;
  object: string;
  quote: any;
  currency: string;
  payment_settings: StripePaymentSettings;
  footer: any;
  total_excluding_tax: number;
  customer_address: any;
  ending_balance: number;
  customer_email: string;
};
