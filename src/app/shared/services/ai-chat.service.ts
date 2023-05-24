import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SSE } from 'sse.js';
import { AiChatMessageRole, AiChatRepo, AiChatRequestData } from '../models/ai-chat.model';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

	constructor(
		private zone: NgZone
	) { }

	createQuery(repo: AiChatRepo, query: string, timeoutSeconds = 60): Observable<string> {
		return new Observable((observer) => {
			const closeStream = () => {
				ev.close();
				observer.complete();
			}

			let result = '';

			if (!repo) {
				observer.error('The repository is invalid.');
				closeStream();
				return;
			};

			if (!query) {
				observer.error('The query is invalid.');
				closeStream();
				return;
			};

			const data: AiChatRequestData = {
				messages: [{ role: AiChatMessageRole.User, content: query }],
				repo: repo,
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
						observer.next(result);
					}
				})
			}

			ev.onerror = (event: any) => {
				this.zone.run(() => {
					observer.error(event);
					closeStream();
				})
			}

			ev.stream();

			setTimeout(() => {
				closeStream();
			}, timeoutSeconds * 1000);
		})

	}
}
