import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRolesComponent {

	form = new FormGroup({
		input: new FormControl('', { validators: Validators.required, nonNullable: true })
	})

	@Input('uid') set setUid(value: string | undefined) {
		this._uid.next(value);
	}

	private _uid: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

	roles$ = this._uid.pipe(
		switchMap(uid => {
			if (!uid) return of([]);
			return this.permissions.getPermissions$(uid);
		})
	)

	constructor(
		private permissions: UserPermissionsService,
	) { }

	async submit() {
		const val = this.form.value.input;
		const uid = this._uid.getValue();
		if (!val || !uid) return;
		await this.permissions.setPermissions(uid, [val]);
		this.form.reset();
	}

	async remove(role: string) {
		const uid = this._uid.getValue();
		if (!uid) return;
		await this.permissions.removePermissions(uid, [role]);
	}

}
