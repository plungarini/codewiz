import { PlatformLocation } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Subscription, switchMap } from 'rxjs';
import { LegalService } from '../shared/services/legal.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styles: [
    `
      :host {
        display: block;
      }

			@keyframes wiggle {
				0%, 100% {
					transform: translateX(-15%);
					animation-timing-function: cubic-bezier(0.8,0,1,1);
				}
				50% {
					transform: none;
					animation-timing-function: cubic-bezier(0,0,0.2,1);
				}
			}

			.animate-wiggle {
				animation: wiggle 0.2s 3;
				animation-fill-mode: forwards;
			}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalComponent implements OnDestroy, OnInit {
	
	error = '';

	private routeSub: Subscription | undefined;

	constructor(
		private legalService: LegalService,
		private route: ActivatedRoute,
		private location: PlatformLocation,
		private cdRef: ChangeDetectorRef,
	) {
		
	}

	ngOnInit(): void {
		this.routeSub = this.route.params.pipe(
			switchMap((params) => {
				const id = params['id'];
				return this.legalService.getDocuments().pipe(
					map((documents) => {
						if (!documents || !id) return undefined;
						
						switch (id) {
							case 'privacy-policy':
								return { id, url: documents.privacyPolicy };
							case 'cookie-policy':
								return { id, url: documents.cookiePolicy };
							case 'terms-of-service':
								return { id, url: documents.termsConditions };
							default:
								return undefined;
						}
					})
				);
			}),
		).subscribe((e) => {
			if (!e || !e.url) {
				this.error = 'Unable to retrieve the document. Please make sure that the URL is correct.';
				this.cdRef.detectChanges();
				return;
			}
			this.location.replaceState(null, '', '');
			window.location.href = e.url;
		});
	}

	ngOnDestroy(): void {
		this.routeSub?.unsubscribe();
	}

	private normDocName(name: string): string {
		const norm = name.replaceAll('-', ' ').toLowerCase();
		const sections = norm.split(' ');
		return sections.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
	}

}
