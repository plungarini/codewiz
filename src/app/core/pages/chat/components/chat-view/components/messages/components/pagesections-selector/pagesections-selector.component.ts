import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { AiChatMessage } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-pagesections-selector',
  templateUrl: './pagesections-selector.component.html',
  styles: [
    `
      :host {
        @apply absolute bottom-0 left-0 pl-5 pr-[2.6rem] w-full max-w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagesectionsSelectorComponent {

	@Input('pageSections') set setPageSections(value: AiChatMessage['pageSections']) {
		if (!value || value.length <= 0) return;
		this.updatePageSectionsUrl(value);
	};
	@Input() show: boolean = false;
	@Input('hostUrl') set setHostUrl(value: string) {
		this.hostUrl = value;
		this.updatePageSectionsUrl();
	}
	@Input('replaceUrl') set setReplaceUrl(value: string) {
		this.replaceUrl = value;
		this.updatePageSectionsUrl();
	}
	@Input('replaceStrings') set setReplaceStrings(value: { s: string, r: string }[]) {
		this.replaceStrings = value;
		this.updatePageSectionsUrl();
	}

	hostUrl: string = 'https://angular.io/';
	replaceUrl: string = 'angular/angular/aio/content/';
	replaceStrings: { s: string, r: string }[] = [
		{ s: '/index', r: '' }
	];

	@Output() onClose = new EventEmitter();

	pageSections: AiChatMessage['pageSections'];

	constructor(
		private cdRef: ChangeDetectorRef,
	) { }

	private updatePageSectionsUrl(sections?: AiChatMessage['pageSections']): void {
		this.pageSections = (sections || this.pageSections)?.map((s) => {
			const url = this.getParsedUrl(s.id);
			return { id: url, title: s.title };
		});
		const urls = new Set();
    this.pageSections = this.pageSections?.filter(section => {
        if (!urls.has(section.id)) {
            urls.add(section.id);
            return true;
        }
        return false;
		});
		this.cdRef.detectChanges();
	}

	getParsedUrl(id: string): string {
		const absoluteUrlRegex = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
		let path = '';

		// Remove number from id
		const numberIdRegex = /^(.*?)(?:\[\d+\])?$/;
		const match = id.match(numberIdRegex);
		path = match ? match[1] : id;

    // If the URL is already absolute, return it as is
    if (absoluteUrlRegex.test(id)) {
			path = id.replace(this.replaceUrl, '');;
    } else {
			// If the URL is not absolute, perform the replacement
			path = path.replace(this.replaceUrl, this.hostUrl);
		}

		this.replaceStrings.forEach((v) => {
			path = path.replace(v.s, v.r);
		});

		return path;
	}

	close(): void {
		this.onClose.emit();
	}

}
