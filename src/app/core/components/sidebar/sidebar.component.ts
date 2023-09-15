import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, Subscription } from 'rxjs';
import { UserPermissionsService } from 'src/app/auth/services/user-permissions.service';
import { UsersService } from 'src/app/auth/services/users.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnDestroy {
	routerSub: Subscription | undefined;
	currentPage: string = 'home';

	menuOpen = false;

	isUserAdmin$: Observable<boolean>;
	userSub$: Observable<string> = this.users.user$.pipe(
		map((u) => {
			return u?.subscriptions?.filter((s) => s?.status === 'active')?.at(0)?.role || 'apprentice';
		})
	);

	constructor(
		private router: Router,
		private cdRef: ChangeDetectorRef,
		private users: UsersService,
		private permissions: UserPermissionsService,
	) {
		this.isUserAdmin$ = this.permissions.hasAllPermissions$(['admin']);

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
					} else if (e.url.includes('settings')) {
						this.currentPage = 'settings';
					} else if (e.url.includes('setup')) {
						this.currentPage = 'setup';
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

	toggleMenu(state?: boolean): void {
    this.menuOpen = state !== undefined ? state : !this.menuOpen;
    this.cdRef.detectChanges();
  }

}
