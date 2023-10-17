import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RepoStat } from '../../../../../../../shared/models/chat-stats.model';
import { ChatStatsService } from '../../../../../../../shared/services/chat-stats.service';

@Component({
  selector: 'app-chat-stats',
  templateUrl: './chat-stats.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatStatsComponent {

	stats$ = this.chatStatsService.getAllChatStats();
	statTime: 'total' | 'lastMonth' = 'lastMonth';
	today = new Date();

	constructor(
		private chatStatsService: ChatStatsService,
	) { }

	getTotalCount(stats: RepoStat[]): number {
		let totalCount: number = 0;
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = this.statTime === 'total' ? repoStat : repoStat.history.find((item) => item.updatedAt.toDate() > this._getLastDayOfLastMonth());
			if (!historyItem) return;
			totalCount += historyItem.prompt?.count ?? 0;
		});
		return totalCount;
	}

	getTotalCountLastMonth(stats: RepoStat[]): number {
		let totalCount: number = 0;
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = repoStat.history.find((item) => item.updatedAt.toDate().getMonth() === this._getLastDayOfLastMonth().getMonth());
			if (!historyItem) return;
			totalCount += historyItem.prompt?.count || 0;
		});
		return totalCount;
	}

	getTotalCost(stats: RepoStat[]): number {
		let totalCost: number = 0;
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = this.statTime === 'total' ? repoStat : repoStat.history.find((item) => item.updatedAt.toDate() > this._getLastDayOfLastMonth());
			if (!historyItem) return;
			const promptTotalUSD: number = historyItem.prompt?.totalUSD ?? 0;
			const completionTotalUSD: number = historyItem.completion?.totalUSD ?? 0;
			const itemTotalCost: number = promptTotalUSD + completionTotalUSD;
			totalCost += itemTotalCost;
		});
		return totalCost;
	}

	getTotalCostLastMonth(stats: RepoStat[]): number {
		let totalCost: number = 0;
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = repoStat.history.find((item) => item.updatedAt.toDate().getMonth() === this._getLastDayOfLastMonth().getMonth());
			if (!historyItem) return;
			const promptTotalUSD: number = historyItem.prompt?.totalUSD ?? 0;
			const completionTotalUSD: number = historyItem.completion?.totalUSD ?? 0;
			const itemTotalCost: number = promptTotalUSD + completionTotalUSD;
			totalCost += itemTotalCost;
		});
		return totalCost;
	}

	getPricePerQuestion(stats: RepoStat[]): number {
		let costs: number[] = [];
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = this.statTime === 'total' ? repoStat : repoStat.history.find((item) => item.updatedAt.toDate() > this._getLastDayOfLastMonth());
			if (!historyItem) return;
			const promptTotalUSD: number = historyItem.prompt?.averageUSDPerPrompt ?? 0;
			const completionTotalUSD: number = historyItem.completion?.averageUSDPerCompletion ?? 0;
			const itemTotalCost: number = promptTotalUSD + completionTotalUSD;
			costs.push(itemTotalCost);
		});

		const sum = costs.reduce((a, b) => a + b, 0);

		return costs.length > 0 ? sum / costs.length : 0;
	}

	getPricePerQuestionLastMonth(stats: RepoStat[]): number {
		let costs: number[] = [];
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = repoStat.history.find((item) => item.updatedAt.toDate().getMonth() === this._getLastDayOfLastMonth().getMonth());
			if (!historyItem) return;
			const promptTotalUSD: number = historyItem.prompt?.averageUSDPerPrompt ?? 0;
			const completionTotalUSD: number = historyItem.completion?.averageUSDPerCompletion ?? 0;
			const itemTotalCost: number = promptTotalUSD + completionTotalUSD;
			costs.push(itemTotalCost);
		});

		const sum = costs.reduce((a, b) => a + b, 0);
		return costs.length > 0 ? sum / costs.length : 0;
	}

	getPricePerPrompt(stats: RepoStat[]): number {
		let costs: number[] = [];
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = this.statTime === 'total' ? repoStat : repoStat.history.find((item) => item.updatedAt.toDate() > this._getLastDayOfLastMonth());
			if (!historyItem) return;
			costs.push(historyItem.prompt?.averageUSDPerPrompt ?? 0);
		});

		const sum = costs.reduce((a, b) => a + b, 0);

		return costs.length > 0 ? sum / costs.length : 0;
	}

	getPricePerPromptLastMonth(stats: RepoStat[]): number {
		let costs: number[] = [];
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = repoStat.history.find((item) => item.updatedAt.toDate().getMonth() === this._getLastDayOfLastMonth().getMonth());
			if (!historyItem) return;
			costs.push(historyItem.prompt?.averageUSDPerPrompt || 0);
		});

		const sum = costs.reduce((a, b) => a + b, 0);
		return costs.length > 0 ? sum / costs.length : 0;
	}

	getPricePerCompletion(stats: RepoStat[]): number {
		let costs: number[] = [];
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = this.statTime === 'total' ? repoStat : repoStat.history.find((item) => item.updatedAt.toDate() > this._getLastDayOfLastMonth());
			if (!historyItem) return;
			costs.push(historyItem.completion?.averageUSDPerCompletion ?? 0);
		});

		const sum = costs.reduce((a, b) => a + b, 0);

		return costs.length > 0 ? sum / costs.length : 0;
	}

	getPricePerCompletionLastMonth(stats: RepoStat[]): number {
		let costs: number[] = [];
		stats.forEach((repoStat: RepoStat) => {
			const historyItem = repoStat.history.find((item) => item.updatedAt.toDate().getMonth() === this._getLastDayOfLastMonth().getMonth());
			if (!historyItem) return;
			costs.push(historyItem.completion?.averageUSDPerCompletion ?? 0);
		});

		const sum = costs.reduce((a, b) => a + b, 0);
		return costs.length > 0 ? sum / costs.length : 0;
	}

	getPriceDifference(current: number, past: number): number {
		if (past === 0) {
			if (current === 0) {
				return 0;
			} else {
				return 100;
			}
		} else {
			return ((current - past) / Math.abs(past)) * 100;
		}
	}

	trackBy(i: number, obj: RepoStat): string {
		return obj.id ?? i.toString();
	}

	private _getLastDayOfLastMonth() {
		let date = new Date();
		date.setDate(1);  // Set to the first day of the current month
		date.setDate(date.getDate() - 1);  // Subtract one day to go to the last day of the previous month

		return date;
	}

}
