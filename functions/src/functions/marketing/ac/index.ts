import { production } from '../../../utils';
import { AcContact } from './models/ac-contact.model';
import { CreateTag, GetContact, GetContactLists, ListAllTags, SyncContact } from './models/ac-responses.model';

/* eslint-disable require-jsdoc */
export class ActiveCampaign {
	private _AC_URL = process.env.AC_URL;
	private _AC_KEY = process.env.AC_KEY;
	private _AC_HEADERS: HeadersInit = {
		'Api-Token': this._AC_KEY ?? '',
		'Accept': 'application/json',
		'content-type': 'application/json',
	};

	private async api<T>(endPoint: string, options?: RequestInit, method = 'GET'): Promise<T | undefined> {
		if (!production()) return;
		const opt: RequestInit = { method: method, headers: this._AC_HEADERS, ...options };
		const res = await fetch(endPoint, opt);
		return res.json();
	}

	async listAllTags() {
    const endPoint = this._AC_URL + 'tags';
    return await this.api<ListAllTags>(endPoint);
	}

	async getContact(email: string) {
    const endPoint = this._AC_URL + `contacts?email=${email}`;
    return await this.api<GetContact>(endPoint);
	}

	async addTag(tagName: string) {
    const tag = {
			tag: {
				tag: tagName,
				tagType: 'contact',
				description: '',
			},
    };
    const endPoint = this._AC_URL + 'tags';
    return await this.api<CreateTag>(endPoint, { body: JSON.stringify(tag) }, 'POST');
	}

	async addTagToContact(contactId: number | string, tagId: string) {
    const contactTag = {
			contactTag: {
				tag: tagId,
				contact: contactId,
			},
    };
    const endPoint = this._AC_URL + 'contactTags';
    return await this.api(endPoint, { body: JSON.stringify(contactTag) }, 'POST');
	}

	async getContactLists(contactId: number | string) {
		const endPoint = this._AC_URL + `contacts/${contactId}/contactLists`;
		return await this.api<GetContactLists>(endPoint);
	}

	async addContactToList(contactId: number | string, listId: number | string, status: 'active' | 'inactive') {
		const normedStatus = status === 'active' ? 1 : 2;
    const contactList = {
			contactList: {
				list: listId,
				contact: contactId,
				status: normedStatus,
			},
    };
    const endPoint = this._AC_URL + 'contactLists';
    return await this.api<void>(endPoint, { body: JSON.stringify(contactList) }, 'POST');
	}

	async addContact(contact: AcContact) {
    const options = this.buildOptions(contact);
    const endPoint = this._AC_URL + 'contact/sync';
    return await this.api<SyncContact>(endPoint, { body: JSON.stringify(options) }, 'POST');
	}

	private buildOptions(contact: AcContact) {
		return {
			contact: {
				email: contact.email ?? '',
				firstName: contact.firstName ?? '',
				lastName: contact.lastName ?? '',
				phone: contact.phone ?? '',
				fieldValues: this.buildFieldValues(contact.attributes),
			},
		};
	}

	private buildFieldValues(attributes: AcContact['attributes']) {
    const { appId, membership, onboarding, stripeId, usage, lernUsage } = attributes;

    return [
			{ field: 1, value: appId ?? '' },
			{ field: 12, value: stripeId ?? '' },
			{ field: 3, value: membership ?? '' },
			{ field: 4, value: onboarding?.onboarded ? 'Yes' : 'No' },
			{ field: 5, value: onboarding?.interests ?? '' },
			{ field: 6, value: onboarding?.experience ?? '' },
			{ field: 7, value: onboarding?.goals ?? '' },
			...this.buildUsageFieldValues(usage),
			...this.buildLernUsageFieldValues(lernUsage),
    ];
	}

	private buildUsageFieldValues(usage: AcContact['attributes']['usage']) {
    return [
			{ field: 8, value: usage?.total ?? 0 },
			{ field: 9, value: usage?.max ?? 0 },
			{ field: 10, value: usage?.month ?? 0 },
			{ field: 11, value: usage?.remaining ?? 0 },
			{ field: 13, value: usage?.credits ?? 0 },
    ];
	}

	private buildLernUsageFieldValues(lernUsage: AcContact['attributes']['lernUsage']) {
    return [
			{ field: 14, value: lernUsage.total ?? 0 },
			{ field: 15, value: lernUsage.max ?? 0 },
			{ field: 16, value: lernUsage.month ?? 0 },
			{ field: 17, value: lernUsage.remaining ?? 0 },
			{ field: 18, value: lernUsage.credits ?? 0 },
    ];
	}
}
