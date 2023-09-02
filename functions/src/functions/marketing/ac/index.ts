import { warn } from 'firebase-functions/logger';
import { AcContact } from './models/ac-contact.model';

/* eslint-disable require-jsdoc */
export class ActiveCampaign {
	private _AC_URL = process.env.AC_URL;
	private _AC_KEY = process.env.AC_KEY;
	private _AC_HEADERS = {
		'Api-Token': this._AC_KEY,
		'Accept': 'application/json',
		'content-type': 'application/json',
	};

	private async api(endPoint: string, options?: RequestInit, method = 'GET') {
		const opt = Object.assign({ method: method, headers: this._AC_HEADERS }, options);
		const res = await fetch(endPoint, opt);
		return res.json();
	}

	async listAllTags() {
    const endPoint = this._AC_URL + 'tags';
    return await this.api(endPoint);
	}

	async getContact(email: string) {
    const endPoint = this._AC_URL + `contacts?email=${email}`;
    return await this.api(endPoint);
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
    return await this.api(endPoint, { body: JSON.stringify(tag) }, 'POST');
	}

	async addTagToContact(contactId: string, tagId: string) {
    const contactTag = {
			contactTag: {
				tag: tagId,
				contact: contactId,
			},
    };
    const endPoint = this._AC_URL + 'contactTags';
    return await this.api(endPoint, { body: JSON.stringify(contactTag) }, 'POST');
	}

	async addContactToList(contactId: string, listId: number, status: 0 | 1) {
    const contactList = {
			contactList: {
				list: listId,
				contact: contactId,
				status: status,
			},
    };
    const endPoint = this._AC_URL + 'contactLists';
    return await this.api(endPoint, { body: JSON.stringify(contactList) }, 'POST');
	}

	async addContact(contact: AcContact) {
		const {
			email,
			firstName,
			lastName,
			phone,
			attributes,
		} = contact;

		const {
			appId,
			membership,
			onboarding,
			stripeId,
			usage,
		} = attributes;

		const options = {
			contact: {
				email: email || '',
				firstName: firstName || '',
				lastName: lastName || '',
				phone: phone || '',
				fieldValues: [
					{
						field: 1,
						value: appId || '',
					},
					{
						field: 12,
						value: stripeId || '',
					},
					{
						field: 3,
						value: membership || '',
					},
					{
						field: 4,
						value: onboarding?.onboarded ? 'Yes' : 'No',
					},
					{
						field: 5,
						value: onboarding?.interests || '',
					},
					{
						field: 6,
						value: onboarding?.experience || '',
					},
					{
						field: 7,
						value: onboarding?.goals || '',
					},
					{
						field: 8,
						value: usage?.total || 0,
					},
					{
						field: 9,
						value: usage?.max || 0,
					},
					{
						field: 10,
						value: usage?.month || 0,
					},
					{
						field: 11,
						value: usage?.remaining || 0,
					},
				],
			},
    };
    const endPoint = this._AC_URL + 'contact/sync';
		const addContact = await this.api(endPoint, { body: JSON.stringify(options) }, 'POST');
		warn({ addContact });
	}
}
