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
} 