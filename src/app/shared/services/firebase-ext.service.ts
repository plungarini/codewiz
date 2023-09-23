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
import { Functions, getFunctions, httpsCallable, httpsCallableFromURL } from '@angular/fire/functions';
import { traceUntilFirst } from '@angular/fire/performance';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseExtendedService {

	private debug = false;
	private production = false;
	private cloudId;
	privateProjectName = 'codewiz-prod';

	constructor(
		private firestore: Firestore,
		private functions: Functions,
	) {
		this.production = false;
		try {
			this.production = eval(environment.production);
			this.cloudId = this.production ? 'ytzgrgrjxq-ew' : 'ik2jh2ngra-ew';
		} catch (err) {
			this.production = false;
			this.cloudId = this.production ? 'ytzgrgrjxq-ew' : 'ik2jh2ngra-ew';
			console.error(err);
		}
	}
	
	callFunction<T, Z>(name: string, region = 'europe-west1', version: number = 2, timeout = 60_000) {
		const instance = this.functions.region === region ? this.functions : getFunctions(undefined, region);

		if (version === 1) {
			return httpsCallable<T, Z>(instance, name, { timeout });
		} else {
			const url = this._buildFunctionUrl(name, region, version);
			return httpsCallableFromURL<T, Z>(instance, url, { timeout });
		}
	}
	
	async getColRef(path: string, ...queryConstraints: QueryConstraint[]): Promise<QuerySnapshot<DocumentData> | undefined> {
		if (!path) return undefined;

    let ref: Query;
    const colRef = collection(this.firestore, path) as CollectionReference;
		ref = query(colRef, ...queryConstraints);
		return getDocs(ref);
	}

	async getDocPromise<T>(path: string): Promise<T | undefined> {
    if (!path) return undefined;
		const docRef = doc(this.firestore, path) as DocumentReference<T>;
		return (await getDocFb<T>(docRef)).data();
	}
	
	getDoc<T>(path: string): Observable<T | undefined> {
    if (!path) return of(undefined);
		const docRef = doc(this.firestore, path) as DocumentReference<T>;
		let debugLogged = !this.debug;

		return docData<T>(docRef, { idField: 'id' }).pipe(
			traceUntilFirst(`[getDoc] ${path}`),
			catchError((err, caught) => {
				if (this.debug && !debugLogged) {
					console.error('[Firebase "getDoc"]', {
						err,
						...arguments,
					});
					debugLogged = true;
				}
				return caught;
			}),
		);
	}
	
	async getColPromise<T>(path: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
    if (!path) return [];

    let ref: Query<T>;
    const colRef = collection(this.firestore, path) as CollectionReference<T>;
		ref = query<T>(colRef, ...queryConstraints);
		return (await getDocs<T>(ref)).docs.map(d => ({ id: d.id, ...d.data() }))
  }

	getCol<T>(path: string, idField = 'id', ...queryConstraints: QueryConstraint[]): Observable<T[]> {
		if (!path) return of([]);

		let ref: Query<T>;
		const colRef = collection(this.firestore, path) as CollectionReference<T>;
		ref = query<T>(colRef, ...queryConstraints);
		
		let debugLogged = !this.debug;
		return collectionData<T>(ref, { idField }).pipe(
			traceUntilFirst(`[getDoc] ${path}`),
			catchError((err, caught) => {
				if (this.debug && !debugLogged) {
					console.error('[Firebase "getDoc"]', {
						err,
						...arguments,
					});
					debugLogged = true;
				}
				return caught;
			}),
		);
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
		const get = await getDocFb(docRef);
		const exist = get.exists();
		const createdAt = get.data()?.['createdAt'] || new Date();

    if (!exist)
      return await setDoc(
        docRef,
        {
          ...obj,
          createdAt,
          updatedAt: new Date(),
        },
        { merge: true }
      );

    return await updateDoc(docRef, {
			...obj,
			createdAt,
      updatedAt: new Date(),
    });
  }

	async delete(path: string): Promise<void> {
    if (!path) return;

    const docRef = doc(this.firestore, path);
    return await deleteDoc(docRef);
  }

	async deleteCollection(path: string, ...queryConstraints: QueryConstraint[]): Promise<void> {
		if (!path) return;
		
		const colRef = await this.getColRef(path, ...queryConstraints);
		colRef?.docs.forEach((d) => {
			this.delete(path + '/' + d.id)
				.catch(err => {
					console.warn(`Unable to delete doc at ${path}/${d.id}`, err);
				});
		});
	}

	private _buildFunctionUrl(name: string, region: string, version = 2): string {
		if (version === 1) {
			return `https://${region}-${this.privateProjectName}.cloudfunctions.net/${name}`;
		} else {
			return `https://${name.toLowerCase().trim()}-${this.cloudId}.a.run.app`;
		}
	}
}