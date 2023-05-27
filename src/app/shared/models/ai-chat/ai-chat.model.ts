export enum AiChatMessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum AiChatRepo {
	Angular = 'angular/angular'
}

type AiChatMessageError = {
	message?: string;
	debug?: {
		type?: string;
		message?: string;
	}
}

export interface AiChatMessage extends AiChatMessageReqItem  {
	completed: boolean;
	error?: AiChatMessageError;
}

type AiChatMessageReqItem = {
	role: AiChatMessageRole;
	content: string;
}

export type AiChatRequestData = {
	repo: AiChatRepo;
	messages: AiChatMessageReqItem[];
	onlyPrompt: boolean;
	stream: boolean;
}

export type PageSection = {
	id: string;
	title: string;
};

export type AiChatResponseData = {
	completion: string;
	pageSections: PageSection[];
	finishReason?: 'stop' | 'lenght';
}
