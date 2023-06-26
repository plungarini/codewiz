import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable, Subscription } from 'rxjs';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnDestroy {
	routerSub: Subscription | undefined;
	currentPage: string = 'home';

	isUserAdmin$: Observable<boolean>

	constructor(
		private router: Router,
		private cdRef: ChangeDetectorRef,
		private permissions: UserPermissionsService,
	) {
		this.isUserAdmin$ = this.permissions.hasPermissions$(['admin']);

		this.routerSub = this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((e) => {
				if (e instanceof NavigationEnd) {
					if (e.url.includes('chat')) {
						this.currentPage = 'chat';
					} else if (e.url.includes('admin')) {
						this.currentPage = 'admin';
					} else if (e.url.includes('app')) {
						this.currentPage = 'app';
					} else {
						this.currentPage = 'app';
					}
					this.cdRef.detectChanges();
        }
      });
	}

	ngOnDestroy(): void {
		this.routerSub?.unsubscribe();
	}

}
