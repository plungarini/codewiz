import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from 'src/app/auth/models/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHeaderComponent {

	private production = false;

	@Input() user: User | undefined;
	
	firebaseBaseUrl;
	stripeBaseUrl;

	constructor() {
		this.production = false;
		try {
			this.production = eval(environment.production);
			this.firebaseBaseUrl = `https://console.firebase.google.com/u/0/project/${this.production ? 'codewiz-prod' : 'codewiz-staging'}/firestore/data/~2Fusers~2F`;
			this.stripeBaseUrl = `https://dashboard.stripe.com/${this.production ? '' : 'test/'}customers/`;
		} catch (err) {
			this.production = false;
			this.firebaseBaseUrl = `https://console.firebase.google.com/u/0/project/${this.production ? 'codewiz-prod' : 'codewiz-staging'}/firestore/data/~2Fusers~2F`;
			this.stripeBaseUrl = `https://dashboard.stripe.com/${this.production ? '' : 'test/'}customers/`;
			console.error(err);
		}
	}

}
