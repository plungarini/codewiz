import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from 'src/app/auth/models/user.model';

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

	@Input() user: User | undefined;

	firebaseBaseUrl = 'https://console.firebase.google.com/u/0/project/codewiz-prod/firestore/data/~2Fusers~2F';
	stripeBaseUrl = 'https://dashboard.stripe.com/customers/';

}
