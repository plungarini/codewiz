import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';

@Component({
	selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: [
    `
      :host {
        @apply block fixed inset-x-0 top-0 z-[5000];
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnDestroy {

	isScrolled = false;
	currentPage = 'home';
	menuOpen = false;

	user$ = this.users.user$;

	private routerSub: Subscription;
	private pages = ['features', 'pricing'];

	constructor(
		private router: Router,
		private users: UsersService,
		private cdRef: ChangeDetectorRef,
	) {
		this.routerSub = this.router.events.subscribe(() => {
			const url = this.router.url;
			let newPage = 'home';
			for (const page of this.pages) {
				if (url.includes(page)) {
					newPage = page;
					break;
				}
			}
			if (newPage !== this.currentPage) {
				this.currentPage = newPage;
				this.cdRef.markForCheck();
			}

		})
	}

	ngOnDestroy(): void {
		this.routerSub.unsubscribe();
	}

  @HostListener('window:scroll')
	onWindowScroll() {
		this.manageScroll();
	}

  @HostListener('document:scroll')
	onDocumentScroll() {
		this.manageScroll();
	}

	toggleMenu(state?: boolean): void {
    this.menuOpen = state !== undefined ? state : !this.menuOpen;
    this.cdRef.detectChanges();
	}
	
	private manageScroll(): void {
		const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
		const condition = scrollPosition > 0;
		if (this.isScrolled !== condition) {
			this.isScrolled = condition;
			this.cdRef.markForCheck();
		}
	}

}
