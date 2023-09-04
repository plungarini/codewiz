export type GetContact = {
  contacts: {
		cdate: string;
		email: string;
		phone: string;
		firstName: string;
		lastName: string;
		orgid: string;
		orgname: string;
		segmentio_id: string;
		bounced_hard: string;
		bounced_soft: string;
		bounced_date: string;
		ip: string;
		ua: string;
		hash: string;
		socialdata_lastcheck: string;
		email_local: string;
		email_domain: string;
		sentcnt: string;
		rating_tstamp: string;
		gravatar: string;
		deleted: string;
		anonymized: string;
		adate: string;
		udate: string;
		edate: string;
		deleted_at: string;
		created_utc_timestamp: string;
		updated_utc_timestamp: string;
		created_timestamp: string;
		updated_timestamp: string;
		created_by: string;
		updated_by: string;
		mpp_tracking: string;
		scoreValues: string[];
		accountContacts: string[];
		links: {
			bounceLogs: string;
			contactAutomations: string;
			contactData: string;
			contactGoals: string;
			contactLists: string;
			contactLogs: string;
			contactTags: string;
			contactDeals: string;
			deals: string;
			fieldValues: string;
			geoIps: string;
			notes: string;
			organization: string;
			plusAppend: string;
			trackingLogs: string;
			scoreValues: string;
			accountContacts: string;
			automationEntryCounts: string;
		}
		id: string;
		organization: string;
	}[]
}

export type CreateTag = {
	tag: {
		tag: string;
		description: string;
		tagType: string;
		cdate: string;
		links: {
			contactGoalTags: string;
			templateTags: string;
		}
		id: string;
	}
}

export type ListAllTags = {
	tags: CreateTag['tag'][];
	meta: {
		total: string;
	}
}

export type GetContactLists = {
  contactLists: {
		contact: string;
		list: string;
		form: string | null;
		seriesid: string;
		sdate: string;
		udate?: string;
		status: string;
		responder: string;
		sync: string;
		unsubreason: string;
		campaign: string | null;
		message: string | null;
		first_name: string;
		last_name: string;
		ip4Sub: string;
		sourceid: string;
		autosyncLog: string | null;
		ip4_last: string;
		ip4Unsub: string;
		created_timestamp: string;
		updated_timestamp: string;
		created_by?: string;
		updated_by?: string;
		unsubscribeAutomation: string | null;
		links: {
			automation: string;
			list: string;
			contact: string;
			form: string;
			autosyncLog: string;
			campaign: string;
			unsubscribeAutomation: string;
			message: string;
		};
		id: string;
		automation: string | null;
	}[]
}

export type SyncContact = {
	contact: {
		id: string;
	}
}
