import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AiChatMessage } from 'src/app/shared/models/ai-chat/ai-chat.model';

@Component({
  selector: 'app-pagesections-selector',
  templateUrl: './pagesections-selector.component.html',
  styles: [
    `
      :host {
        @apply absolute bottom-0 left-0 px-8 w-full max-w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagesectionsSelectorComponent {

	@Input('pageSections') set setPageSections(value: AiChatMessage['pageSections']) {
		if (!value || value.length <= 0) return;
		this.pageSections = value.map((s) => {
			const url = this.getParsedUrl(s.id);
			return { id: url, title: s.title };
		});
	};
	@Input() hostUrl: string = 'https://angular.io/'; // TODO
	@Input() replaceUrl: string = 'angular/angular/aio/content/'; // TODO
	@Input() replaceStrings: { s: string, r: string }[] = [
		{ s: '/index', r: '' }
	]; // TODO

	@Output() onClose = new EventEmitter();

	pageSections: AiChatMessage['pageSections'];

	getParsedUrl(id: string): string {
		const regex = /^(.*?)(?:\[\d+\])?$/;
		const match = id.match(regex);
		let path = match ? match[1] : id;
		path = path.replace(this.replaceUrl, this.hostUrl);

		this.replaceStrings.forEach((v) => {
			path = path.replace(v.s, v.r);
		});

		return path;
	}

	close(): void {
		this.onClose.emit();
	}

}
