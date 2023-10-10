import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, of, Subscription, switchMap } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

@Component({
  selector: 'app-user-add-credits',
  templateUrl: './user-add-credits.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAddCreditsComponent implements OnDestroy {

	@Input('uid') set setUid(value: string | undefined) {
		this._uid.next(value);
	}

	private _uid = new BehaviorSubject<string | undefined>(undefined);

	form = new FormGroup({
		lernCredits: new FormControl(0, { nonNullable: true, updateOn: 'blur' }),
		chatCredits: new FormControl(0, { nonNullable: true, updateOn: 'blur' }),
	}, { updateOn: 'blur' });

	private _formSub: Subscription;
	private _dbSub: Subscription;

	constructor(
		private db: FirebaseExtendedService,
	) {
		this._dbSub = this._uid.pipe(
			switchMap((uid) => {
				if (!uid) return of(undefined);
				return this.db.getDoc<{ lernCredits?: number; chatCredits?: number }>(`users/${uid}/protected/usages`);
			}),
		).subscribe((res) => {
			this.form.patchValue({
				lernCredits: res?.lernCredits ?? 0,
				chatCredits: res?.chatCredits ?? 0,
			}, { emitEvent: false });
		});

		this._formSub = this.form.valueChanges.subscribe((val) => {
			this.editCredits(val.lernCredits, val.chatCredits);
		})
	}

	ngOnDestroy(): void {
		this._formSub.unsubscribe();
		this._dbSub.unsubscribe();
	}

	async editCredits(lernCredits?: number, chatCredits?: number) {
		const id = this._uid.getValue();
		if (!id) return;
		await this.db.upsert(`users/${id}/protected/usages`, {
			lernCredits,
			chatCredits,
		})
	}

}
