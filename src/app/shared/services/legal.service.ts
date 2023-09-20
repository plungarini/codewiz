import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseExtendedService } from './firebase-ext.service';

type LegalDocuments = {
	cookiePolicy?: string;
	privacyPolicy?: string;
	termsConditions?: string;
	dsarForm?: string;
}


@Injectable({
  providedIn: 'root'
})
export class LegalService {

	constructor(
		private db: FirebaseExtendedService,
	) { }
	
	getDocuments(): Observable<LegalDocuments | undefined> {
		return this.db.getDoc<LegalDocuments>('stats/legal');
	}
}
