import { firestore } from '../../utils';

export const addChatCountOnStats = async (repo?: string) => {
	if (!repo) return;

	const statsRef = firestore.doc(`stats/completions/repos/${repo}`);
	const doc = await statsRef.get();
	const data = doc.data();

	const now = new Date();
	const dateId = `${now.getMonth() < 10 ? '0' : ''}${now.getMonth()}_${now.getFullYear()}`;

	const statsByDateRef = firestore.doc(`stats/completions/repos/${repo}/byDate/${dateId}`);
	const statsByDateDoc = await statsByDateRef.get();
	const statsByDateData = statsByDateDoc.data();

	const newData = {
		...data,
		chatCount: (data?.chatCount || 0) + 1,
	};
	const newDataByDate = {
		...statsByDateData,
		chatCount: (statsByDateData?.chatCount || 0) + 1,
	};

	await statsRef.set(newData, { merge: true });
	await statsByDateRef.set(newDataByDate, { merge: true });
};
