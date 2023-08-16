import { StripeSubscription } from './subscription.model';
import { Timestamp } from './timestamp.model';

export type UserDetails = {
  imgUrl?: string;
  phoneNumber?: string;
  lastLogin?: Timestamp;
  profileUrlRef?: string;
  firstLogin?: boolean;
}

export type UserRole = {
	id: string;
	name: string;
	permissions: string[]
}

export type HypixelDetails = {
	apiKey?: string;
	ign?: string;
	uuid?: string;
	defaultProfileId?: string;
}

export type DiscordDetails = {
	did?: string;
}

export type User = {
  id?: string;
	name?: string;
	usageDetails?: UsageStats;
	usages?: UserUsages[];
	subscriptions?: StripeSubscription[];
	revenueDetails?: RevenueDetails; 
  email?: string;
  disabled?: boolean;
	onboardingCompleted?: boolean;
	details?: UserDetails;
	permissions?: string[];
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