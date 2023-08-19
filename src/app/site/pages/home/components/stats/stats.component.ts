import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { map, Subscription, switchMap } from 'rxjs';
import { ChatStatsService } from 'src/app/shared/services/chat-stats.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';

type PublicStats = {
	chatCount?: number;
	promptCount?: number;
	reposCount?: number;
	usersCount?: number;
	updatedAt?: Date;
};

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsComponent implements OnDestroy {

	stats: PublicStats = {
		chatCount: 0,
		promptCount: 0,
		reposCount: 0,
		usersCount: 0,
		updatedAt: new Date(),
	};
	publicReleaseDate = new Date(2022, 8, 1);

	private usersCountSub: Subscription;
	private chatsSub: Subscription;

	constructor(
		private chatStats: ChatStatsService,
		private db: FirebaseExtendedService,
		private cdRef: ChangeDetectorRef,
	) {
		this.usersCountSub = this.db.getDoc<{ usersCount: number }>('stats/users')
			.subscribe((data) => {
				this.stats.usersCount = data?.usersCount || 0;
				this.stats.updatedAt = new Date();
				this.cdRef.markForCheck();
			})
		
		this.chatsSub = this.chatStats.getAllChatStats()
			.pipe(
				switchMap(stats => {
					return this.chatStats.getAllSupportedRepos().pipe(
						map(repos => ({
							stats,
							repos,
						}))
					)
				})
			)
			.subscribe(({ stats, repos }) => {
				this.stats = {
					...this.stats,
					chatCount: stats.reduce((acc, stat) => acc + (stat.chatCount || 0), 0),
					promptCount: stats.reduce((acc, stat) => acc + (stat.prompt?.count || 0), 0),
					reposCount: repos.length,
					updatedAt: new Date(),
				};
				this.cdRef.markForCheck();
			});
	}

	ngOnDestroy(): void {
		this.usersCountSub.unsubscribe();
		this.chatsSub.unsubscribe();
	}

	formatNumber(number?: number): string {
		if (!number) number = 0;
    if (number < 1000) {
      return number.toString();
    } else if (number < 1000000) {
      const roundedNumber = (number / 1000).toFixed(2);
      return `${roundedNumber}K`;
    } else {
      const millionNumber = (number / 1000000).toFixed(2);
      return `${millionNumber}M`;
    }
  }

}
