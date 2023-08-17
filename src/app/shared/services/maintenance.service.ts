import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppStatus } from '../models/app-status.model';
import { FirebaseExtendedService } from './firebase-ext.service';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getStatus(): Observable<AppStatus | undefined> {
		return this.db.getDoc<AppStatus>('app/status');
	}
}
