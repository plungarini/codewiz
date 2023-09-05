import { warn } from 'firebase-functions/logger';
import { StripeProduct } from '../../models/subscription/stripe-product.model';
import { StripeSubscription } from '../../models/subscription/subscription.model';
import { OnboardingData } from '../../models/user/onboarding.model';
import { User, UserUsageDetails } from '../../models/user/user.model';
import { firestore } from '../../utils';
import { ActiveCampaign } from './ac';


const getSubscriptions = async (uid: string) => {
	return (await firestore.collection(`users/${uid}/subscriptions`).get())
		.docs.map((d) => d.data() as StripeSubscription | undefined)
		.filter((d) => !!d && ['active', 'trialing'].includes(d?.status || 'inactive')) as StripeSubscription[];
};

const getOnboarding = async (uid: string) => {
	return (await firestore.doc(`users/${uid}/onboarding/data`).get()).data() as OnboardingData | undefined;
};

const getUsedQueries = async (uid: string) => {
	const repos = (await firestore.collection('supported-docs').get()).docs.map((d) => d.id);
	const usagesPromises = repos.map(async (repo) => {
		return {
			repoId: repo,
			stats: (await firestore.collection(`users/${uid}/protected/usages/${repo}`).get()).docs.map((d) => ({ id: d.id, ...d.data() }) as UserUsageDetails),
		};
	});
	const usages = (await Promise.allSettled(usagesPromises)).map((res) => {
		if (res.status === 'rejected') {
			warn('Promise rejected in usages', { cause: res.reason });
			return undefined;
		} else {
			return res.value;
		}
	}).filter((s) => (s?.stats.length || 0) > 0);

	warn({ usages });

	const thisMonthUsageRef = firestore
		.collection(`users/${uid}/protected/usages/bySubscription`)
		.orderBy('createdAt', 'desc')
		.limit(1);
	const thisMonthDoc = await thisMonthUsageRef.get();
	const thisMonthUsage = thisMonthDoc.docs.at(0)?.data()?.count || 0;
	warn({ thisMonthUsage });

	const nonFiltered = usages.map((s) => {
		return s?.stats.reduce((a, b) => a + (b.prompt?.count || 0), 0);
	});
	const totalSum = nonFiltered.reduce((a, b) => (a || 0) + (b || 0), 0);
	return { month: thisMonthUsage, total: totalSum };
};

export const upsertAcUser = async (
	uid: string,
	user?: User,
) => {
	if (!user) user = (await firestore.doc(`users/${uid}`).get()).data();
	if (!user) throw new Error('Unable to retrieve user');

	const subscriptions = await getSubscriptions(uid);
	const onboarding = await getOnboarding(uid);
	const usage = await getUsedQueries(uid);

	const {
		email,
		name,
		id,
		details,
		stripeId,
	} = user;
	if (!email) throw new Error('User email is not defined.');

	let firstName = '';
	let lastName = '';
	if (name) {
		if (name.trim().includes(' ')) {
			const sections = name.split(' ');
			firstName = sections.slice(0, -1).join(' ');
			lastName = sections.at(-1) || '';
		} else {
			firstName = name;
		}
	}

	const product = (await subscriptions?.at(0)?.product?.get())?.data() as StripeProduct | undefined;
	const maxUsage = parseInt(product?.metadata?.maxPromptCountMonth || '50') || 50;

	const sdk = new ActiveCampaign();

	const addContact = await sdk.addContact({
		email,
		firstName,
		lastName,
		phone: details?.phoneNumber,
		attributes: {
			appId: id,
			stripeId: stripeId,
			membership: product?.role || 'apprentice',
			onboarding: {
				interests: onboarding?.codingInterests.join(', '),
				experience: onboarding?.experience,
				goals: onboarding?.goals.join(', '),
				onboarded: onboarding?.onboarded,
			},
			usage: {
				total: usage?.total || 0,
				max: maxUsage,
				month: usage?.month || 0,
				remaining: maxUsage - (usage?.month || 0),
			},
		},
	});

	warn({ addContact });
	const addedId = addContact?.contact?.id;
	if (!addedId) return warn('User added to ActiveCampaign but id is undefined');
	const lists = await sdk.getContactLists(addedId);

	await firestore.doc(`users/${uid}`).update({
		activeCampaignId: addedId,
		updatedAt: new Date(),
	});

	const hasList = lists?.contactLists.find((l) => l.id === '2');
	if (hasList) return;

	await sdk.addContactToList(addedId, '2', 'active');
	warn('User added to Platform Users List.');
};
