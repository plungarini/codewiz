import { Injectable } from '@angular/core';
import {
	collection, collectionData, CollectionReference,
	deleteDoc,
	doc,
	docData,
	DocumentData,
	DocumentReference,
	Firestore,
	getDoc as getDocFb,
	getDocs,
	Query,
	query,
	QueryConstraint,
	QuerySnapshot,
	setDoc,
	updateDoc
} from '@angular/fire/firestore';
import { Functions, getFunctions, httpsCallable } from '@angular/fire/functions';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseExtendedService {

	private debug = false;

	constructor(
		private firestore: Firestore,
		private functions: Functions
	) { }
	
	callFunction<T, Z>(name: string, region = 'europe-west2', timeout = 60_000) {
		if (this.debug) console.log('[Firebase "callFunction"]', { name, timeout });
		const instance = this.functions.region === region ? this.functions : getFunctions(undefined, region);
		return httpsCallable<T, Z>(instance, name, { timeout });
	}
	
	async getColRef(path: string, ...queryConstraints: QueryConstraint[]): Promise<QuerySnapshot<DocumentData> | undefined> {
		if (this.debug) console.log('[Firebase "getColRef"]', { path, queryConstraints });
		if (!path) return undefined;

    let ref: Query;
    const colRef = collection(this.firestore, path) as CollectionReference;
		ref = query(colRef, ...queryConstraints);
		return getDocs(ref);
	}

	async getDocPromise<T>(path: string): Promise<T | undefined> {
		if (this.debug) console.log('[Firebase "getDocPromise"]', { path });
    if (!path) return undefined;
		const docRef = doc(this.firestore, path) as DocumentReference<T>;
		return (await getDocFb<T>(docRef)).data();
	}
	
	getDoc<T>(path: string): Observable<T | undefined> {
		if (this.debug) console.log('[Firebase "getDoc"]', { path });
    if (!path) return of(undefined);
    const docRef = doc(this.firestore, path) as DocumentReference<T>;
    return docData<T>(docRef, { idField: 'id' });
	}
	
	async getColPromise<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
		if (this.debug) console.log('[Firebase "getColPromise"]', { path, queryConstraints });
    if (!path) return [];

    let ref: Query<T>;
    const colRef = collection(this.firestore, path) as CollectionReference<T>;
		ref = query<T>(colRef, ...queryConstraints);
		return (await getDocs<T>(ref)).docs.map(d => ({ id: d.id, ...d.data()}))
  }

	getCol<T>(path: string, idField = 'id', ...queryConstraints: QueryConstraint[]): Observable<T[]> {
		if (this.debug) console.log('[Firebase "getCol"]', { path, idField, queryConstraints });
		if (!path) return of([]);

		let ref: Query<T>;
		const colRef = collection(this.firestore, path) as CollectionReference<T>;
		ref = query<T>(colRef, ...queryConstraints);
		return collectionData<T>(ref, { idField });
	}

  generateId(): string {
    const ref = doc(collection(this.firestore, 'users'));
    return ref.id;
  }

  async docExists(path: string): Promise<boolean> {
    const docRef = doc(this.firestore, path);
    const exist = (await getDocFb(docRef)).exists();
    return exist;
  }

	async upsert<T>(path: string, obj: Partial<T>): Promise<void> {
		if (this.debug) console.log('[Firebase "upsert"]', { path, obj });
    if (!path) return;

    const docRef = doc(this.firestore, path);
		const exist = (await getDocFb(docRef)).exists();
		
		obj = JSON.parse(JSON.stringify(obj, function(k, v) {
			if (v === undefined) { return null; } return v; 
		}));

    if (!exist)
      return await setDoc(
        docRef,
        {
          ...obj,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

    return await updateDoc(docRef, {
      ...obj,
      updatedAt: new Date(),
    });
  }

	async delete(path: string): Promise<void> {
		if (this.debug) console.log('[Firebase "delete"]', { path });
    if (!path) return;

    const docRef = doc(this.firestore, path);
    return await deleteDoc(docRef);
  }

	async deleteCollection(path: string, ...queryConstraints: QueryConstraint[]): Promise<void> {
		if (this.debug) console.log('[Firebase "deleteCollection"]', { path, queryConstraints });
		if (!path) return;
		
		const colRef = await this.getColRef(path, ...queryConstraints);
		colRef?.docs.forEach((d) => {
			this.delete(path + '/' + d.id)
				.catch(err => {
					console.warn(`Unable to delete doc at ${path}/${d.id}`, err);
				});
		});
	}
}