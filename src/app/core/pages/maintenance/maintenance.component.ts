import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { MaintenanceService } from 'src/app/shared/services/maintenance.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styles: [
    `
      :host {
        @apply block relative w-full h-full;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceComponent {

	status$ = this.maintenanceService.getStatus().pipe(
		tap(status => {
			if (!status?.maintenance.active) {
				this.router.navigate(['/app']);
			}
		})
	);

	constructor(
		private maintenanceService: MaintenanceService,
		private router: Router,
	) { }

}
