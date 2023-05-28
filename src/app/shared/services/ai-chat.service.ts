import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { filter, interval, lastValueFrom, map, Observable, startWith, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SSE } from 'sse.js';
import { AiChatComponentStatus, AiChatStatus, AiChatStatusIndicator, ClientOpenaiStatus } from '../models/ai-chat/ai-chat-status.model';
import { AiChatMessage, AiChatMessageRole, AiChatRepo, AiChatRequestData, AiChatResponseData } from '../models/ai-chat/ai-chat.model';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
	private statusUrl = 'https://status.openai.com/api/v2/summary.json';

	constructor(
		private zone: NgZone,
		private http: HttpClient,
	) { }

	getStatusPromise(): Promise<ClientOpenaiStatus> {
		const $status = this.http.get<AiChatStatus>(this.statusUrl).pipe(
			filter((res) => !!res),
			
			// Select recent incident
			map((res) => {
				const filteredIncidents = res.incidents.filter((i) =>
					!i.resolved_at && // Filter not resolved ones
					i.components.filter((c) => c.name === 'API')[0].status !== AiChatComponentStatus.Operational // Filter only API issues with status !== operational
				);

				if (!filteredIncidents || filteredIncidents.length <= 0) {
					const status = {
						...res,
						status: { indicator: AiChatStatusIndicator.None }
					} as AiChatStatus;

					const newStatus = {
						indicator: status.status.indicator || AiChatStatusIndicator.None,
						title: status.incidents[0]?.name || AiChatStatusIndicator.None ? 'OpenAI\'s APIs are online' : 'Unable to detect OpenAI status',
						message: status.incidents[0]?.incident_updates[0].body || AiChatStatusIndicator.None ? '' : 'Click here to visit the status webpage.',
						link: status.incidents[0]?.shortlink || 'https://status.openai.com/',
					};

					return newStatus;
				}

				const recentIncident = filteredIncidents.sort((a, b) =>
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				)[0];

				const normIncident = {
					...recentIncident,
					incident_updates: recentIncident.incident_updates.sort((a, b) => 
						new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
					)
				}

				const status = { ...res, incidents: [normIncident] } as AiChatStatus;

				const newStatus = {
					indicator: status.status.indicator || AiChatStatusIndicator.None,
					title: status.incidents[0]?.name || AiChatStatusIndicator.None ? 'OpenAI\'s APIs are online' : 'Unable to detect OpenAI status',
					message: status.incidents[0]?.incident_updates[0].body || AiChatStatusIndicator.None ? '' : 'Click here to visit the status webpage.',
					link: status.incidents[0]?.shortlink || 'https://status.openai.com/',
				};

				return newStatus;
			})
		);

		return lastValueFrom($status);		
	}

	getStatus(mins = 5): Observable<ClientOpenaiStatus> {
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

				if (!filteredIncidents || filteredIncidents.length <= 0) {
					const status = {
						...res,
						status: { indicator: AiChatStatusIndicator.None }
					} as AiChatStatus;

					const newStatus = {
						indicator: status.status.indicator || AiChatStatusIndicator.None,
						title: status.incidents[0]?.name || AiChatStatusIndicator.None ? 'OpenAI\'s APIs are online' : 'Unable to detect OpenAI status',
						message: status.incidents[0]?.incident_updates[0].body || AiChatStatusIndicator.None ? '' : 'Click here to visit the status webpage.',
						link: status.incidents[0]?.shortlink || 'https://status.openai.com/',
					};

					return newStatus;
				}

				const recentIncident = filteredIncidents.sort((a, b) =>
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				)[0];

				const normIncident = {
					...recentIncident,
					incident_updates: recentIncident.incident_updates.sort((a, b) => 
						new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
					)
				}

				const status = { ...res, incidents: [normIncident] } as AiChatStatus;

				const newStatus = {
					indicator: status.status.indicator || AiChatStatusIndicator.None,
					title: status.incidents[0]?.name || AiChatStatusIndicator.None ? 'OpenAI\'s APIs are online' : 'Unable to detect OpenAI status',
					message: status.incidents[0]?.incident_updates[0].body || AiChatStatusIndicator.None ? '' : 'Click here to visit the status webpage.',
					link: status.incidents[0]?.shortlink || 'https://status.openai.com/',
				};

				return newStatus;
			})
		);
	}

	createQuery(repo: AiChatRepo, chat: AiChatMessage[], timeoutSeconds = 30): Observable<AiChatResponseData> {
		return new Observable((observer) => {
			let result = '';
			let finishReason: "stop" | "lenght" | undefined = undefined;
			const pageSections: { id: string; title: string; }[] = [];
			
			let sinceLastRes = new Date().getTime() / 1000; // In seconds
			const normMessages = chat
				.map(m => ({ role: m.role, content: m.content }));
			
			// If last chat message is from Assistant, removes it
			if (normMessages[normMessages.length - 1].role === AiChatMessageRole.Assistant) {
				normMessages.pop();
			}

			const closeStream = () => {
				ev?.close();
				clearInterval(timeoutCheckInterval);
				observer.complete();
			}

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

			if (!repo) {
				observer.error('The repository is invalid.');
				closeStream();
				return;
			};

			if (
				normMessages.length <= 0 ||
				!normMessages[normMessages.length - 1].content ||
				normMessages[normMessages.length - 1].role !== AiChatMessageRole.User
			) {
				observer.error(`The query is invalid: ${JSON.stringify(normMessages)}`);
				closeStream();
				return;
			};

			const data: AiChatRequestData = {
				messages: normMessages,
				repo,
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
					
					const completionResponse = JSON.parse(event.data);
					const choices = completionResponse.choices[0];
					const message = choices?.delta?.content;
					if (message) {
						result += message;
						sinceLastRes = new Date().getTime() / 1000;
						observer.next({
							completion: result,
							pageSections,
							finishReason
						});
					}

					if (choices.finish_reason) {
						finishReason = choices.finish_reason;
					}

					if (completionResponse.page_sections) {
						pageSections.push(...completionResponse.page_sections);
					};
				})
			}

			ev.onerror = (event: any) => {
				console.log('error', event);
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
