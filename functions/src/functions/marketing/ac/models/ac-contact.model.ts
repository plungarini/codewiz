export type AcContact = {
	email: string;
	firstName?: string;
	lastName?: string;
	phone?: string;

	attributes: {
		appId?: string;
		stripeId?: string;
		membership?: string;
		onboarding?: {
			interests?: string;
			experience?: string;
			goals?: string;
			onboarded?: boolean;
		};
		usage?: {
			total?: number;
			max?: number;
			month?: number;
			remaining?: number;
			credits?: number;
		};
		lernUsage: {
			total?: number;
			max?: number;
			month?: number;
			remaining?: number;
			credits?: number;
		};
	}
}
