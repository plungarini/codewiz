import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SSE } from 'sse.js';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

	constructor(
		private zone: NgZone
	) { }

	createQuery(query: string, timeoutSeconds = 60): Observable<string> {
		return new Observable((observer) => {
			const closeStream = () => {
				ev.close();
				observer.complete();
			}

			let result = '';

			if (!query) {
				observer.error('The query is invalid.');
				closeStream();
				return;
			};

			const ev = new SSE(
				`https://${environment.supabase.projectRef}.functions.supabase.co/ai-docs`,
				{
					headers: {
						apikey: environment.supabase.anonKey,
						Authorization: `Bearer ${environment.supabase.anonKey}`,
						'Content-Type': 'application/json',
					},
					payload: JSON.stringify({ query, onlyPrompt: false, stream: true }),
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
