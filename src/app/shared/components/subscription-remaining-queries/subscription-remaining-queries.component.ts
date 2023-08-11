import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-subscription-remaining-queries',
  templateUrl: './subscription-remaining-queries.component.html',
  styles: [
    `
      :host {
        @apply block w-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionRemainingQueriesComponent {

	@Input() percentage: number = 0;
	@Input() theme: 'light' | 'dark' = 'dark';
	@Input() label: string = '';

	tooltipLeft = 0;
	tooltipTop = 0;

	@HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.tooltipLeft = event.clientX;
    this.tooltipTop = event.clientY;
  }

}
