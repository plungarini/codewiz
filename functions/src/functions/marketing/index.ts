import { warn } from 'firebase-functions/logger';
import { StripeProduct } from '../../models/subscription/stripe-product.model';
import { StripeSubscription } from '../../models/subscription/subscription.model';
import { OnboardingData } from '../../models/user/onboarding.model';
import { User, UserUsageDetails } from '../../models/user/user.model';
import { firestore } from '../../utils';
import { ActiveCampaign } from './ac';
import { addContactToActiveCampaign, calculateMaxUsage, ensureContactInList, extractUserDetails, fetchProductFromSubscription, fetchUserFromFirestore, getCredits, syncActiveCampaignIdWithFirestore, validateInputs } from './ac/upsert';


const getSubscriptions = async (uid: string) => {
	return (await firestore.collection(`users/${uid}/subscriptions`).get())
		.docs.map((d) => d.data() as StripeSubscription | undefined)
		.filter((d) => !!d && ['active', 'trialing'].includes(d?.status || 'inactive')) as StripeSubscription[];
};

const getOnboarding = async (uid: string) => {
	return (await firestore.doc(`users/${uid}/onboarding/data`).get()).data() as OnboardingData | undefined;
};

const getUsage = async (uid: string, product?: StripeProduct) => {
	const repos = (await firestore.collection('supported-docs').get()).docs.map((d) => d.id);
	const chatUsagesPromises = repos.map(async (repo) => {
		return {
			repoId: repo,
			stats: (await firestore.collection(`users/${uid}/protected/usages/${repo}`).get()).docs.map((d) => ({ id: d.id, ...d.data() }) as UserUsageDetails),
		};
	});

	const chatUsages = (await Promise.allSettled(chatUsagesPromises)).map((res) => {
		if (res.status === 'rejected') {
			warn('Promise rejected in usages', { cause: res.reason });
			return undefined;
		} else {
			return res.value;
		}
	}).filter((s) => (s?.stats.length ?? 0) > 0);

	const thisMonthUsageRef = firestore
		.collection(`users/${uid}/protected/usages/bySubscription`)
		.orderBy('createdAt', 'desc');
	const thisMonthDoc = await thisMonthUsageRef.get();
	const thisMonthData = thisMonthDoc.docs.at(0)?.data();

	if (!thisMonthData) {
		return {
			usage: { month: 0, total: 0, max: 0, credits: 0, remaining: 0 },
			lernUsage: { month: 0, total: 0, max: 0, credits: 0, remaining: 0 },
		};
	}

	warn({ thisMonthUsage: thisMonthData });
	const thisMonthChatUsage: number = thisMonthData.count ?? 0;
	const thisMonthChatCreditsUsed: number = thisMonthData.chatCreditsUsed ?? 0;
	const thisMonthLernUsage: number = thisMonthData.lernCount ?? 0;
	const thisMonthLernCreditsUsed: number = thisMonthData.lernCreditsUsed ?? 0;
	const maxUsage = calculateMaxUsage(product);
	const credits = await getCredits(uid);

	const totalChats = chatUsages.map((s) => {
		return s?.stats.reduce((a, b) => a + (b.prompt?.count ?? 0), 0);
	}).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

	const totalLerns = thisMonthDoc.docs
		.map((d) => (d.data()?.lernCount ?? 0) as number)
		.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

	const totalChatCredits = credits.chat + thisMonthChatCreditsUsed;
	const totalLernCredits = credits.lern + thisMonthLernCreditsUsed;

	const usages = {
		usage: {
			month: thisMonthChatUsage,
			total: totalChats,
			max: maxUsage.chat,
			credits: totalChatCredits,
			remaining: (maxUsage.chat + totalChatCredits) - thisMonthChatUsage,
		},
		lernUsage: {
			month: thisMonthLernUsage,
			total: totalLerns,
			max: maxUsage.lern,
			credits: totalLernCredits,
			remaining: (maxUsage.lern + totalLernCredits) - thisMonthLernUsage,
		},
	};

	warn({ result: usages });

	return usages;
};

export const upsertAcUser = async (
	uid: string,
	user?: User,
) => {
	user = user ?? (await fetchUserFromFirestore(uid));

	validateInputs(uid, user);

  const subscriptions = await getSubscriptions(uid);
  const onboarding = await getOnboarding(uid);
  const product = await fetchProductFromSubscription(subscriptions);
	const usages = await getUsage(uid, product);
  const { email, firstName, lastName, phone, activeCampaignId, stripeId } = extractUserDetails(user);

	const sdk = new ActiveCampaign();

  const addedId = await addContactToActiveCampaign(sdk, {
    email,
    firstName,
    lastName,
    phone,
    uid,
    stripeId,
    product,
    onboarding,
    ...usages,
  });

  await syncActiveCampaignIdWithFirestore(uid, addedId, activeCampaignId);

  await ensureContactInList(sdk, addedId);
};
