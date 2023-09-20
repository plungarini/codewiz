export interface SchemaOrg {
	"@type"?: 'Organization';
	name?: string;
	email?: string;
	description?: string;
	url?: string;
	logo?: string;
	founder?: PersonSchemaOrg[];
	foundingDate?: string;
	sameAs?: string[];
	address?: Address
	contactPoint?: ContactPoint[];
}

export interface CourseListSchemaOrg {
	"@type":"ItemList";
	"itemListElement": {
		"@type": "ListItem";
		"position": number;
		item: CourseSchemaOrg;
	}[]
}

export interface CourseSchemaOrg {
	"@type"?: 'Course';
	"@id"?: string;
	name?: string;
	description?: string;
	image?: string;
	url?: string;
	datePublished?: string;
	instructor?: PersonSchemaOrg[];
	provider?: {
		"@type"?: 'Organization';
		name?: 'PADI';
		sameAs?: 'https://www.padi.com/';
	};
	hasCourseInstance: CourseInstance;
}

interface CourseInstance {
	"@type"?: 'CourseInstance';
	instructor?: PersonSchemaOrg[];
}

export interface ArticleSchemaOrg {
	"@type"?: 'Article';
	headline?: string;
	description?: string;
	image?: string;
	datePublished?: string;
	dateModified?: string;
	url?: string;
	keywords?: string[];
	author?: PersonSchemaOrg[];
}

export interface PersonSchemaOrg {
	"@type"?: 'Person';
	name?: string;
	jobTitle?: string;
	description?: string;
	image?: string;
	email?: string;
	telephone?: string;
	url?: string;
	knowsLanguage?: string[];
	sameAs?: string[];
	affiliation?: {
		"@type"?: 'Organization';
		name?: 'PADI';
		sameAs?: 'https://www.padi.com/';
	};
	birthDate?: string;
	
}

interface Address {
	"@type"?: string;
	addressLocality?: string;
	addressRegion?: string;
	postalCode?: string;
	addressCountry?: string;
}

interface ContactPoint {
	"@type"?: string;
	telephone?: string;
	contactType?: string;
	availableLanguage?: string[];
}
