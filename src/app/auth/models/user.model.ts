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
  email?: string;
  disabled?: boolean;
	onboardingCompleted?: boolean;
	details?: UserDetails;
	permissions?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
