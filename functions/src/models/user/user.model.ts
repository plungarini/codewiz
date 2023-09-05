import { Timestamp } from 'firebase-admin/firestore';
import { StripeSubscription } from '../subscription/subscription.model';


export type UserDetails = {
  imgUrl?: string;
}

export type User = {
  id?: string;
	name?: string;
	usageDetails?: UsageStats;
	usages?: UserUsages[];
	subscriptions?: StripeSubscription[];
	revenueDetails?: RevenueDetails;
	phone?: string;
  email?: string;
	details?: UserDetails;
	activeCampaignId?: string;
	stripeId?: string;
	stripeLink?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

type RevenueDetails = {
	totalPaid?: number;
	paidThisMonth?: number;
	totalCost?: number;
	totalCostThisMonth?: number;
}

type UsageStats = {
	currentMonth: UserUsageDetails;
	total: UserUsageDetails
}

export type UserUsageDetails = {
	id?: string;
	completion?: Usage;
	prompt?: Usage;
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
}

type Usage = {
	count?: number;
	usedTokens?: number;
	usedUSD?: number;
}

export type UserUsages = {
	id: string;
	stats: UserUsageDetails[];
}
