import { Injectable } from '@angular/core';
import {
	collection, collectionData, CollectionReference,
	deleteDoc,
	doc,
	docData,
	DocumentReference,
	Firestore,
	getDoc as getDocFb,
	getDocs,
	Query,
	query,
	QueryConstraint,
	setDoc,
	updateDoc
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseExtendedService {

	constructor(
		private firestore: Firestore
	) { }
	
	async getColRef(path: string,  ...queryConstraints: QueryConstraint[]) {
		if (!path) return undefined;

    let ref: Query;
    const colRef = collection(this.firestore, path) as CollectionReference;
		ref = query(colRef, ...queryConstraints);
		return await getDocs(ref);
	}

  async getDocPromise<T>(path: string): Promise<T | undefined> {
    if (!path) return undefined;
		const docRef = doc(this.firestore, path) as DocumentReference<T>;
		return (await getDocFb<T>(docRef)).data();
	}
	
  getDoc<T>(path: string): Observable<T | undefined> {
    if (!path) return of(undefined);
    const docRef = doc(this.firestore, path) as DocumentReference<T>;
    return docData<T>(docRef, { idField: 'id' });
	}
	
	async getColPromise<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
    if (!path) return [];

    let ref: Query<T>;
    const colRef = collection(this.firestore, path) as CollectionReference<T>;
		ref = query<T>(colRef, ...queryConstraints);
		return (await getDocs<T>(ref)).docs.map(d => ({ id: d.id, ...d.data()}))
  }

	getCol<T>(path: string, idField = 'id', ...queryConstraints: QueryConstraint[]): Observable<T[]> {
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
    if (!path) return;

    const docRef = doc(this.firestore, path);
    const exist = (await getDocFb(docRef)).exists();

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
    if (!path) return;

    const docRef = doc(this.firestore, path);
    return await deleteDoc(docRef);
  }
}