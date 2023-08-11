import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-subscription-remaining',
  templateUrl: './subscription-remaining.component.html',
  styles: [
    `
			circle {
				transition: stroke-dashoffset 0.8s ease-in-out;
			}

      :host {
        @apply block max-w-full max-h-full;
			}
    `
	],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionRemainingComponent implements OnChanges {
	
	@Input() percentage = 0;
	@Input() remaining = 0;
	@Input() label = 'days';
	@Input() theme: 'light' | 'dark' = 'dark';

  // Assuming the circle radius is 50 and cx, cy (the center of the circle) is 50, 50
  readonly CIRCUMFERENCE: number = 2 * Math.PI * 50;
  offset: number = this.CIRCUMFERENCE;

  ngOnChanges() {
		this.offset = this.CIRCUMFERENCE - (this.percentage / 100) * this.CIRCUMFERENCE;
		this.cdRef.markForCheck();
  }
	
	constructor(
		private cdRef: ChangeDetectorRef
	) { }

}
