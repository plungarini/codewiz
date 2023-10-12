import { warn } from 'firebase-functions/logger';
import { ActiveCampaign } from '..';
import { StripeProduct } from '../../../../models/subscription/stripe-product.model';
import { StripeSubscription } from '../../../../models/subscription/subscription.model';
import { OnboardingData } from '../../../../models/user/onboarding.model';
import { User } from '../../../../models/user/user.model';
import { firestore } from '../../../../utils';

type AcContactUpsert = {
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	uid: string;
	stripeId: string;
	product: StripeProduct;
	onboarding: OnboardingData;
	usage: { month?: number; total?: number; max?: number; credits?: number; remaining?: number };
	lernUsage: { month?: number; total?: number; max?: number; credits?: number; remaining?: number };
}


export const validateInputs = (uid: string, user?: User) => {
  if (!uid) throw new Error('Unable to retrieve uid');
  if (!user?.email) throw new Error('User email is not defined.');
};

export const fetchUserFromFirestore = async (uid: string): Promise<User> => {
  const user = (await firestore.doc(`users/${uid}`).get()).data();
  if (!user) throw new Error('Unable to retrieve user');
  return user;
};

export const extractUserDetails = (user: User) => {
  const { email, name, phone, activeCampaignId, stripeId } = user;
  const [firstName, lastName] = splitName(name ?? '');
  return { email, firstName, lastName, phone, activeCampaignId, stripeId };
};

const splitName = (name: string): [string, string] => {
  if (name.includes(' ')) {
    const sections = name.split(' ');
    return [sections.slice(0, -1).join(' '), sections.at(-1) ?? ''];
  }
  return [name, ''];
};

export const fetchProductFromSubscription = async (subscriptions: StripeSubscription[]) => {
  return (await subscriptions?.at(0)?.product?.get())?.data() as
    | StripeProduct
    | undefined;
};

export const calculateMaxUsage = (product: StripeProduct | undefined) => {
  const chat = parseInt(product?.metadata?.maxPromptCountMonth ?? '50', 10) || 50;
	const lern = parseInt(product?.metadata?.maxLernCountMonth ?? '0', 10) || 0;
	return { chat, lern };
};

export const getCredits = async (uid: string) => {
	const docRef = firestore.doc(`users/${uid}/protected/usages`);
	const doc = await docRef.get();
	const data = doc.data() as { chatCredits?: number; lernCredits?: number; lernDemoUsed?: boolean } | undefined;
	const credits = {
		chat: data?.chatCredits ?? 0,
		lern: (data?.lernCredits ?? 0) + (!data?.lernDemoUsed ? 1 : 0),
	};
	warn({ credits });
	return credits;
};

export const addContactToActiveCampaign = async (sdk: ActiveCampaign, details: Partial<AcContactUpsert>) => {
	if (!details.email) {
		throw new Error('Unable to retrieve email');
	}

  const addContact = await sdk.addContact({
    email: details.email,
    firstName: details.firstName,
    lastName: details.lastName,
    phone: details.phone,
    attributes: {
      appId: details?.uid ?? '',
      stripeId: details?.stripeId,
      membership: details?.product?.role ?? 'apprentice',
      onboarding: {
        interests: details?.onboarding?.codingInterests.join(', '),
        experience: details?.onboarding?.experience,
        goals: details?.onboarding?.goals.join(', '),
        onboarded: details?.onboarding?.onboarded,
      },
      usage: {
        total: details?.usage?.total ?? 0,
        max: details?.usage?.max,
        month: details?.usage?.month ?? 0,
        credits: details?.usage?.credits,
        remaining: details?.usage?.remaining,
      },
      lernUsage: {
        total: details?.lernUsage?.total ?? 0,
        max: details?.lernUsage?.max,
        month: details?.lernUsage?.month ?? 0,
        credits: details?.lernUsage?.credits,
        remaining: details?.lernUsage?.remaining,
      },
    },
	});

  const addedId = addContact?.contact?.id;
  if (!addedId) {
    warn('User added to ActiveCampaign but id is undefined');
    throw new Error('Unable to retrieve addedId from ActiveCampaign');
  }
  return addedId;
};

export const syncActiveCampaignIdWithFirestore = async (
  uid: string,
  addedId: string,
  activeCampaignId?: string,
) => {
  if (!activeCampaignId || activeCampaignId !== addedId) {
    await firestore.doc(`users/${uid}`).update({
      activeCampaignId: addedId,
      updatedAt: new Date(),
    });
  }
};

export const ensureContactInList = async (sdk: ActiveCampaign, addedId: string) => {
  const lists = await sdk.getContactLists(addedId);
  const hasList = lists?.contactLists.find((l) => l.id === '2');
  if (!hasList) {
    await sdk.addContactToList(addedId, '2', 'active');
    warn('User added to Platform Users List.');
  }
};
