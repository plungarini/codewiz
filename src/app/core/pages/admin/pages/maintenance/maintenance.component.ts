import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MaintenanceService } from 'src/app/shared/services/maintenance.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styles: [
    `
      :host {
        @apply block w-full max-h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceComponent implements OnDestroy {

	form = new FormGroup({
		active: new FormControl(false, { nonNullable: true }),
		reason: new FormControl('', { nonNullable: true }),
	});

	loading = false;

	private maintenanceSub: Subscription;

	constructor(
		private maintenance: MaintenanceService,
		private cdRef: ChangeDetectorRef,
	) {		
		this.maintenanceSub = this.maintenance.getStatus()
			.subscribe((status) => {
				if (!status?.maintenance) return;
				const normData = {
					active: status.maintenance.active,
					reason: status.maintenance.reason,
				};
				this.form.patchValue(normData);
				this.cdRef.markForCheck();
			});
	}

	ngOnDestroy(): void {
		this.maintenanceSub.unsubscribe();
	}

	async saveForm(disable?: boolean): Promise<void> {
		this.loading = true;
		this.cdRef.markForCheck();
		await this.maintenance.setStatus({
			maintenance: {
				active: disable ? false : true,
				reason: disable ? '' : this.form.value.reason,
			}
		});
		this.loading = false;
		this.cdRef.markForCheck();
	}

}
