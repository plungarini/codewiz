import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { filter, interval, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SSE } from 'sse.js';
import { AiChatComponentStatus, AiChatStatus, AiChatStatusIndicator } from '../models/ai-chat/ai-chat-status.model';
import { AiChatMessage, AiChatMessageRole, AiChatRepo, AiChatRequestData } from '../models/ai-chat/ai-chat.model';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
	private statusUrl = 'https://status.openai.com/api/v2/summary.json';
	private previousStatus: AiChatStatusIndicator = AiChatStatusIndicator.None;

	constructor(
		private zone: NgZone,
		private http: HttpClient,
	) { }

	getStatus(mins = 5): Observable<AiChatStatus> {
		return interval(mins * 60 * 1000).pipe(
			startWith(0),
			switchMap(() => this.http.get<AiChatStatus>(this.statusUrl)),
			filter((res) => !!res),
			
			// Select recent incident
			map((res) => {
				const filteredIncidents = res.incidents.filter((i) =>
					!i.resolved_at && // Filter not resolved ones
					i.components.filter((c) => c.name === 'API')[0].status !== AiChatComponentStatus.Operational // Filter only API issues with status !== operational
				);

				if (!filteredIncidents || filteredIncidents.length <= 0) return {
					...res,
					status: { indicator: AiChatStatusIndicator.None }
				} as AiChatStatus;

				const recentIncident = filteredIncidents.sort((a, b) =>
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				)[0];

				const normIncident = {
					...recentIncident,
					incident_updates: recentIncident.incident_updates.sort((a, b) => 
						new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
					)
				}

				return { ...res, incidents: [normIncident] } as AiChatStatus;
			}),

			filter((res) => res.status.indicator !== this.previousStatus),

			tap((res) => this.previousStatus = res.status.indicator)
		);
	}

	createQuery(repo: AiChatRepo, messages: AiChatMessage[], timeoutSeconds = 30): Observable<string> {
		return new Observable((observer) => {
			let result = '';
			let sinceLastRes = new Date().getTime() / 1000; // In seconds

			const timeoutCheckInterval = setInterval(() => {
				const now = new Date().getTime() / 1000;
				if ((now - sinceLastRes) < timeoutSeconds) return;
				const err = {
					"message": "Apologies, but it seems we're experiencing some technical difficulties. Please try again in few minutes or reach out to the support.",
					"debug": {
						"message": `Timeout Error: Request Timed Out (>${timeoutSeconds}s). Please try again later.`,
						"type": "client_error",
					}
				}
				observer.error({
					data: JSON.stringify(err),
				})
				closeStream();
			}, 500);

			const closeStream = () => {
				ev.close();
				clearInterval(timeoutCheckInterval);
				observer.complete();
			}

			if (!repo) {
				observer.error('The repository is invalid.');
				closeStream();
				return;
			};

			if (
				messages.length <= 0 ||
				!messages[messages.length - 1].content ||
				messages[messages.length - 1].role !== AiChatMessageRole.User
			) {
				observer.error(`The query is invalid: ${JSON.stringify(messages)}`);
				closeStream();
				return;
			};

			const data: AiChatRequestData = {
				messages, repo,
				onlyPrompt: false,
				stream: true,
			}

			const ev = new SSE(
				`https://${environment.supabase.projectRef}.functions.supabase.co/ai-docs`,
				{
					headers: {
						apikey: environment.supabase.anonKey,
						Authorization: `Bearer ${environment.supabase.anonKey}`,
						'Content-Type': 'application/json',
					},
					payload: JSON.stringify(data),
				}
			);

			ev.onmessage = (event) => {
				this.zone.run(() => {
					if (event.data === '[DONE]') {
						closeStream();
						return;
					}
					const completionResponse = JSON.parse(event.data)
					const message = completionResponse.choices[0].delta.content;
					if (message) {
						result += message;
						sinceLastRes = new Date().getTime() / 1000;
						observer.next(result);
					}
				})
			}

			ev.onerror = (event: any) => {
				this.zone.run(() => {
					const err = {
						"message": "Apologies, but it seems we're experiencing some technical difficulties. Please try again in few minutes or reach out to the support.",
						"debug": {
							"message": event,
							"type": "server_error",
						}
					}
					observer.error({
						data: JSON.stringify(err),
					})
					observer.error(event);
					closeStream();
				})
			}

			ev.stream();
		})

	}
}
