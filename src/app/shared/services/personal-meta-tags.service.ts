import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ArticleSchemaOrg, CourseListSchemaOrg, CourseSchemaOrg, PersonSchemaOrg, SchemaOrg } from '../models/schema-org.model';


type UpdateArticleMetaTagsArgs = {
	title: string;
	description: string;
	tags: string[];
	createdAt: string;
	img?: string;
}
type UpdateCourseMetaTagsArgs = {
	id: string;
	title: string;
	description?: string;
	createdAt: string;
	img: string;
}
type UpdatePersonMetaTagsArgs = {
	title: string;
	name: string;
	description?: string;
	email: string;
	jobTitle: string;
	languages: string[];
	socials: string[];
	phone: string;
	img: string;
}
type GeneralTags = {
	title: string;
	img?: string;
	description?: string;
	type?: 'website' | 'course' | 'article' | 'person',
}
type InitMetaTagsArgs = {
	description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalMetaTagsService {

	private siteName = 'CodeWiz';
	private defaultDesc = 'Meet CodeWiz – your AI coding companion. Dive into real-time chats, unravel coding mysteries faster than you can type "StackOverflow", and code with confidence. Embrace the future of coding assistance today!';
	private defaultOgImg = 'https://codewiz.imgix.net/site/assets/wizchat_feature.png?ixlib=ng-1.0.0-rc.1&auto=format%2Ccompress&w=2258';
	private schema: SchemaOrg = {};

	constructor(
		private title: Title,
		private meta: Meta,
		private router: Router,
    @Inject(DOCUMENT) private document: Document
	) { }
	
	/**
	 * Initializes meta tags for the webpage, including Open Graph and Twitter metadata.
	 *
	 * @param {InitMetaTagsArgs} opt - Object containing a meta tags of the page.
	 */
	init(opt: InitMetaTagsArgs): void {
		this.defaultDesc = opt.description;

		this.schema = {
			"@type": "Organization",
			"name": this.siteName,
			"email": "info@codewiz.app",
			"description": opt.description,
			"url": "https://codewiz.app",
			"logo": "https://codewiz.app/assets/logo/png/codewiz_pip_dark.png",
			"founder": [
				{
					"@type": "Person",
					"name": "Pietro Lungarini",
					"jobTitle": "Frontend Developer",
					"description": "Hello! I'm Pietro Lungarini, a digital explorer born in 1999. My passion journey began with multimedia and evolved into the creation of Mayp Digital SRL, fusing software development with strategic digital graphics. But amidst it all, a personal need gave birth to CodeWiz. What began as my little coding sidekick has now transformed into a developer's dream assistant.",
					"image": "https://media.licdn.com/dms/image/C4D03AQFpfbn85w5cbg/profile-displayphoto-shrink_800_800/0/1611135917611?e=1700092800&v=beta&t=JUPuEWIRBkPEkT-S3F0VgT5stgkLU79LXk7YWLWWXH8",
					"email": "pietro@codewiz.app",
					"telephone": "+393349447086",
					"knowsLanguage": ["IT", "EN"],
					"birthDate": '1999-06-20',
					"sameAs": [
						"https://instagram.com/wheresbebo",
						"https://www.facebook.com/pietrolungarini",
						"https://linkedin.com/in/plungarini",
						"https://twitter.com/wheresbebo"
					]
				},
			],
			"foundingDate": "2023",
			"sameAs": [
				"https://www.facebook.com/codewizai",
				"https://www.instagram.com/codewiz.ai/",
				"https://x.com/codewizai",
				"https://twitter.com/codewizai",
				"https://www.producthunt.com/products/codewiz"
			],
			"contactPoint": [
				{
					"@type": "ContactPoint",
					"telephone": "+393349447086",
					"contactType": "customer service",
					"availableLanguage": ["IT", "EN"]
				}
			],
		};

		this.meta.addTags([
			{ property: 'og:title', content: this.siteName + ' | Instant AI-Powered Coding Solutions – Faster than StackOverflow' },
			{ property: 'og:description', content: opt.description },
			{ property: 'og:site_name', content: this.siteName },
			{ property: 'og:url', content: 'https://codewiz.app/' },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:locale', content: 'it_IT' },
			{ property: 'fb:app_id', content: '658712932874534' },
			{ name: 'keywords', content: 'CodeWiz, AI assistant, developers, instant code solutions, real-time programming guidance, quicker than StackOverflow, immediate coding answers, chatbot for coding, troubleshoot code instantly, interactive coding quizzes, AI-powered mentor, global coding assistance, friendly developer chatbot, empathic coding help, modern programming guidance, free CodeWiz subscription, premium code assistance, code confidently' },
			{ property: 'og:image', content: this.defaultOgImg },
			{ property: 'og:image:width', content: '2258' },
			{ property: 'og:image:height', content: '1270' },
			{ name: 'twitter:card', content: 'summary' },
			{ name: 'twitter:site', content: this.siteName },
			{ name: 'twitter:image', content: this.defaultOgImg },
			{ name: 'twitter:title', content: 'Instant AI-Powered Coding Solutions – Faster than StackOverflow' },
			{ name: 'twitter:description', content: opt.description },
		]);

		this.update({ ...opt, title: this.siteName + ' | Instant AI-Powered Coding Solutions – Faster than StackOverflow' });
	}

	/**
	 * Sets the course with new meta tags. Removes previous meta tags if present.
	 *
	 * @param {UpdateCourseMetaTagsArgs} opt - An object containing course meta tag options.
	 */
	/* setCourse(opt: UpdateCourseMetaTagsArgs): void {
		const schema: CourseSchemaOrg = {
			"@type": "Course",
			"@id": `https://codewiz.app/courses/info/${opt.id}`,
			"name": opt.title,
			"description": opt.description || this.defaultDesc,
			"datePublished": opt.createdAt,
			"image": opt.img,
			"url": `https://codewiz.app/courses/info/${opt.id}`,
			"hasCourseInstance": {
				"@type": "CourseInstance",
				instructor: this.schema.founder
			},
			"provider": {
				"@type": "Organization",
				"name": 'PADI',
				"sameAs": 'https://www.padi.com/',
			}
		}

		this._update({ ...opt, type: 'course' });
		this.append(schema);
	} */
	
	/**
	 * Sets the course list by updating the course meta tags.
	 *
	 * @param {UpdateCourseMetaTagsArgs[]} opt - An array of objects representing the course meta tags to be updated.
	 */
	/* setCourseList(opt: UpdateCourseMetaTagsArgs[]): void {
		const schema: CourseListSchemaOrg = {
			"@type": "ItemList",
			itemListElement: [],
		}

		for (let i = 0; i < opt.length; i++) {
			const course = opt[i];

			const courseSchema: CourseSchemaOrg = {
				"@type": "Course",
				"@id": `https://codewiz.app/courses/info/${course.id}`,
				"name": course.title,
				"description": course.description || this.defaultDesc,
				"datePublished": course.createdAt,
				"image": course.img,
				"url": `https://codewiz.app/courses/info/${course.id}`,
				"hasCourseInstance": {
					"@type": "CourseInstance",
					instructor: this.schema.founder
				},
				"provider": {
					"@type": "Organization",
					"name": 'PADI',
					"sameAs": 'https://www.padi.com/',
				}
			}

			schema.itemListElement.push({
				"@type": "ListItem",
				position: i + 1,
				item: courseSchema,
			});
		}

		this._update({
			type: 'website',
			title: 'I nostri corsi',
			description: 'Esplora le meraviglie sottomarine con i nostri corsi subacquei. Dalla formazione di base all\'avventura esperta, scopri un nuovo mondo sotto le onde. Unisciti a noi per un\'immersione emozionante!',
		});
		this.append(schema);
	} */

	/**
	 * Sets the article metadata tags.
	 *
	 * @param {UpdateArticleMetaTagsArgs} opt - The options for updating the article metadata tags.
	 */
	/* setArticle(opt: UpdateArticleMetaTagsArgs): void {
		const schema: ArticleSchemaOrg = {
			"@type": "Article",
			"headline": opt.title,
			"description": opt.description,
			"datePublished": opt.createdAt,
			"dateModified": opt.createdAt,
			"url": 'https://codewiz.app' + this.router.url,
			"image": opt.img,
			"keywords": opt.tags,
			"author": [
				{
					"@type": "Person",
					"name": "Pietro Lungarini",
					"url": "https://codewiz.app/about/pietro-lungarini"
				},
				{
					"@type": "Person",
					"name": "Samuele Lungarini",
					"url": "https://codewiz.app/about/samuele-lungarini"
				},
			]
		}

		this._update({ ...opt, type: 'article' });
		this.append(schema);
	} */

	/**
	 * Updates the given GeneralTags object.
	 *
	 * @param {GeneralTags} opt - The GeneralTags object to update.
	 */
	update(opt: GeneralTags): void {
		this.append(this.schema, true);
		this._update(opt);
	}

	/**
	 * Updates the meta tags and title of the page based on the provided options.
	 *
	 * @param {GeneralTags} opt - The options for updating the meta tags and title.
	 */
	private _update(opt: GeneralTags): void {
		this.setCanonical();

		this.title.setTitle(opt.title);
		
		this.meta.updateTag({
			name: '@type',
			content: opt.type || 'website',
		});
		this.meta.updateTag({
			property: 'og:title',
			content: opt.title,
		});
		this.meta.updateTag({
			name: 'description',
			content: opt.description || this.defaultDesc,
		});
		this.meta.updateTag({
			property: 'og:description',
			content: opt.description || this.defaultDesc,
		});
		this.meta.updateTag({
			property: 'og:type',
			content: opt.type === 'article' ? 'article' : 'website',
		});
		this.meta.updateTag({
			name: 'twitter:title',
			content: opt.title,
		});
		this.meta.updateTag({
			name: 'twitter:site',
			content: this.siteName,
		});
		this.meta.updateTag({
			name: 'twitter:image',
			content: opt.img || this.defaultOgImg,
		});
		this.meta.updateTag({
			name: 'twitter:description',
			content: opt.description || this.defaultDesc,
		});
		this.meta.updateTag({
			property: 'og:image',
			content: opt.img || this.defaultOgImg,
		});
		this.meta.updateTag({
			property: 'og:url',
			content: 'https://codewiz.app' + this.router.url,
		});
	}

	private setCanonical(): void {
		let canonical = this.document.getElementById('canonical') as HTMLLinkElement | null;
		if (!canonical) {
			canonical = this.document.createElement('link');
		}

		canonical.rel = 'canonical';
		canonical.href = 'https://codewiz.app' + this.router.url;
		canonical.id = 'canonical';

		if (this.document.head.firstChild) {
			this.document.head.insertBefore(canonical, this.document.head.firstChild);
		} else {
			this.document.head.appendChild(canonical);
		}
	}

	/**
	 * Appends an item to the schema by creating or updating a <script> element in the document's head.
	 *
	 * @param {SchemaOrg | CourseSchemaOrg | ArticleSchemaOrg | CourseListSchemaOrg | PersonSchemaOrg} item - The item to append to the schema.
	 * @param {boolean} isDefault - Whether the item is the default item or not. Default: false.
	 */
	private append(item: SchemaOrg | CourseSchemaOrg | ArticleSchemaOrg | CourseListSchemaOrg | PersonSchemaOrg, isDefault: boolean = false): void {
		let script = this.document.getElementById('schema') as HTMLScriptElement | null;
		if (!script) {
			script = this.document.createElement('script');
		}
		script.setAttribute('type', 'application/ld+json');
		script.id = 'schema';
		
		if (!isDefault) {
			script.text = JSON.stringify({
				'@context': 'https://schema.org',
				'@graph': [this.schema, item],
			});
		} else {
			script.text = JSON.stringify({
				'@context': 'https://schema.org',
				'@graph': [this.schema],
			});
		}

    if (this.document.head.firstChild) {
			this.document.head.insertBefore(script, this.document.head.firstChild);
		} else {
			this.document.head.appendChild(script);
		}
		
	}
	
}
