import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetAlertService {

	private $state = new Subject<boolean>();

	constructor() { }
	
	getState(): Observable<boolean> {
		return this.$state.asObservable();
	}

	setState(state: boolean): void {
		this.$state.next(state);
	}
}
