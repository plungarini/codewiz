import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { filter, firstValueFrom, interval, lastValueFrom, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { environment } from 'src/environments/environment';
import { SSE } from 'sse.js';
import { AiChatComponentStatus, AiChatStatus, AiChatStatusIndicator, ClientOpenaiStatus } from '../models/ai-chat/ai-chat-status.model';
import { AiChatMessage, AiChatMessageFeedback, AiChatMessageRole, AiChatRequestData, AiChatResponseData, AiChatTitleRequestData, AiChatTitleResponseData, AiUserRepoChat } from '../models/ai-chat/ai-chat.model';
import { FirebaseExtendedService } from './firebase-ext.service';


@Injectable({
  providedIn: 'root'
})
export class AiChatService {
	private statusUrl = 'https://status.openai.com/api/v2/summary.json';

	constructor(
		private zone: NgZone,
		private http: HttpClient,
		private db: FirebaseExtendedService,
		private router: Router,
		private users: UsersService
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

					if (newStatus.indicator !== AiChatStatusIndicator.None && newStatus.title === 'OpenAI\'s APIs are online') {
						newStatus.title = 'Minor issues reported in OpenAI\'s APIs';
					}

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

				if (newStatus.indicator !== AiChatStatusIndicator.None && newStatus.title === 'OpenAI\'s APIs are online') {
					newStatus.title = 'Minor issues reported in OpenAI\'s APIs';
				}

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

					if (newStatus.indicator !== AiChatStatusIndicator.None && newStatus.title === 'OpenAI\'s APIs are online') {
						newStatus.title = 'Minor issues reported in OpenAI\'s APIs';
					}

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

				if (newStatus.indicator !== AiChatStatusIndicator.None && newStatus.title === 'OpenAI\'s APIs are online') {
					newStatus.title = 'Minor issues reported in OpenAI\'s APIs';
				}

				return newStatus;
			})
		);
	}

	createQuery(repo: string, chat: AiChatMessage[], timeoutSeconds = 30): Observable<AiChatResponseData> {
		if (chat.length <= 0) throw new Error('Invalid chat array');
		return new Observable((observer) => {
			let result = '';
			let finishReason: AiChatTitleResponseData['finishReason'] = undefined;
			const pageSections: { id: string; title: string; }[] = [];
			
			let sinceLastRes = new Date().getTime() / 1000; // In seconds
			const normMessages = chat
				.filter(m => !!m.content && !!m.role)
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
						sinceLastRes = new Date().getTime() / 1000;
						observer.next({
							completion: result,
							pageSections,
							finishReason
						});
						closeStream();
						return;
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

	createChatTitle(repo: string, id: string, timeoutSeconds = 30): Observable<AiChatTitleResponseData> {
		return this.getChatMessages(repo, id).pipe(
			take(1),
			switchMap((chat) => {
				if (chat.length <= 2) {
					return of({
						completion: '',
						shouldUpdate: false,
					})
				}

				return new Observable<AiChatTitleResponseData>((observer) => {
					let result = '';
					let finishReason: AiChatTitleResponseData['finishReason'] = undefined;
					
					let sinceLastRes = new Date().getTime() / 1000; // In seconds
					const normMessages = chat
						.filter(m => !!m.content && !!m.role)
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

					if (
						normMessages.length <= 0 ||
						!normMessages[normMessages.length - 1].content ||
						normMessages[normMessages.length - 1].role !== AiChatMessageRole.User
					) {
						observer.error(`The query is invalid: ${JSON.stringify(normMessages)}`);
						closeStream();
						return;
					};

					const data: AiChatTitleRequestData = {
						messages: normMessages,
						stream: true,
					}

					const ev = new SSE(
						`https://${environment.supabase.projectRef}.functions.supabase.co/chat-title`,
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
							const message = choices?.delta?.content as string | undefined;
							
							if (message) {
								result += message.split('\n')[0];
								
								sinceLastRes = new Date().getTime() / 1000;
								observer.next({
									completion: result,
									shouldUpdate: true,
									finishReason
								});
							}
							
							if (choices.finish_reason) {
								finishReason = choices.finish_reason;
								sinceLastRes = new Date().getTime() / 1000;
								observer.next({
									completion: result,
									shouldUpdate: true,
									finishReason
								});
								closeStream();
								return;
							}
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
				});
			})
		)
	}

	async saveChatName(name: string, repo: string, chatId: string): Promise<void> {
		const uid = await this._getCurrentUid();
		this.db.upsert<AiUserRepoChat>(`users/${uid}/repos/${repo}/chats/${chatId}`, { name });
	}

	async updateMessageFeedback(message: AiChatMessage): Promise<void> {
		const uid = await this._getCurrentUid();
		const chatId = message.chatId;
		const messageId = message.id;
		const repo = message.repoId;
		if (!uid || !chatId || !messageId || !repo) return console.error('Missing uid, repoId, chatId or messageId: unable to update message feedback.', { uid, chatId, messageId, repo });
		if (!message.feedback) return console.error('Missing feedback: unable to update message feedback.', message);
		await this.db.upsert<AiChatMessage>(`users/${uid}/repos/${repo}/chats/${chatId}/messages/${messageId}`, { feedback: message.feedback });

		if (message.feedback !== 'none' && message.feedback !== undefined) {
			const messages = await firstValueFrom(this.getChatMessages(repo, chatId));
			const feedbackPromptIndex = messages.findIndex(m => m.id === messageId) - 1;
			const prompt = messages[feedbackPromptIndex].role === AiChatMessageRole.User ? messages[feedbackPromptIndex].content : '';
	
			await this.db.upsert<AiChatMessageFeedback>(`feedbacks/${uid}/repos/${repo}/chats/${chatId}/messages/${messageId}`, { ...message, prompt });
		} else {
			await this.db.delete(`feedbacks/${uid}/repos/${repo}/chats/${chatId}/messages/${messageId}`);
		}
	}

	async saveNewMessage(repo: string, chatId: string, message: Partial<AiChatMessage>) {
		const uid = await this._getCurrentUid();
		const newChatId = this.db.generateId();
		
		if (chatId === 'new' || !chatId) {
			await this.createNewChat(repo, newChatId);
		}
		chatId = chatId ? chatId !== 'new' ? chatId : newChatId : newChatId;

		const urls = new Set();
		const pageSections = message.pageSections?.filter(section => {
        if (!urls.has(section.id)) {
            urls.add(section.id);
            return true;
        }
        return false;
		});

		const msgId = message.id || this.db.generateId();
		const normMessage: Partial<AiChatMessage> = {
			...message,
			id: msgId,
			repoId: repo,
			chatId: chatId,
			completed: true,
			pageSections: pageSections || [],
		};
		await this.db.upsert<AiChatMessage>(`users/${uid}/repos/${repo}/chats/${chatId}/messages/${msgId}`, normMessage);

		const colLen = ((await this.db.getColRef(`users/${uid}/repos/${repo}/chats/${chatId}/messages`)) || new Set()).size;
		if (colLen >= 3) await this.db.upsert(`users/${uid}/repos/${repo}/chats/${chatId}`, { updatedAt: new Date() });
		if (colLen >= 3) console.warn('Updating updatedAt')
	}

	async getChatMessageLength(repo: string, chatId: string): Promise<number> {
		const uid = await this._getCurrentUid();
		const colLen = ((await this.db.getColRef(`users/${uid}/repos/${repo}/chats/${chatId}/messages`)) || new Set()).size;
		return colLen;
	}

	async createNewChat(repo: string, chatId?: string) {
		const newId = this.db.generateId();
		const id = chatId ? chatId === 'new' ? newId : chatId : newId;
		const uid = await this._getCurrentUid();
		await this.db.upsert(`users/${uid}/repos/${repo}/chats/${id}`, { name: 'New Chat' });
		await this.db.upsert(`users/${uid}/repos/${repo}/chats/${id}/messages/init`, { hide: true });
		return id;
	}

	getRepoChats(repo: string): Observable<AiUserRepoChat[]> {
		return this._$getCurrentUid().pipe(
			switchMap((uid) =>
				this.db.getCol<AiUserRepoChat>(
					`users/${uid}/repos/${repo}/chats`,
					'id', orderBy('updatedAt', 'desc')
				).pipe(
					map(chat => chat.map(c => ({ ...c, repo }))),
				)
			)
		);
	}

	getChatMessages(repo: string, chatId: string): Observable<AiChatMessage[]> {
		return this._$getCurrentUid().pipe(
			switchMap((uid) =>
				this.db.getCol<AiChatMessage>(
					`users/${uid}/repos/${repo}/chats/${chatId}/messages`,
					'id', orderBy('updatedAt')
				).pipe(
					map(chat => chat.map(c => ({ ...c, repo }))),
				)
			)
		);
	}

	async deleteChat(repo: string, id: string): Promise<void> {
		const uid = await this._getCurrentUid();
		try {
			const path = `users/${uid}/repos/${repo}/chats/${id}`;
			await this.db.deleteCollection(`${path}/messages`);
			await this.db.delete(path);
			this.router.navigateByUrl(`/app/chat/${repo}/new`);
		} catch (err) {
			console.error('Unable to delete collection', err);
		}
	}

	private _$getCurrentUid(): Observable<string> {
		return this.users.fireUser$.pipe(map((u) => u?.uid || ''))
	}

	private _getCurrentUid(): Promise<string> {
		return firstValueFrom(this._$getCurrentUid());
	}
}
