import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-subscription-remaining-days',
  templateUrl: './subscription-remaining-days.component.html',
  styles: [
    `
			circle {
				transition: stroke-dashoffset 0.5s;
			}

      :host {
        @apply block w-full h-full;
			}
    `
	],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionRemainingDaysComponent implements OnChanges {
	
	@Input() percentage: number = 0;

  // Assuming the circle radius is 50 and cx, cy (the center of the circle) is 50, 50
  readonly CIRCUMFERENCE: number = 2 * Math.PI * 50;
  offset: number = this.CIRCUMFERENCE;

  ngOnChanges() {
		this.offset = this.CIRCUMFERENCE - (this.percentage / 100) * this.CIRCUMFERENCE;
		this.cdRef.detectChanges();
  }
	
	constructor(
		private cdRef: ChangeDetectorRef
	) { }

}
