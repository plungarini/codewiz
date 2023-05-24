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

export type AiChatMessage = {
	role: AiChatMessageRole;
	content: string;
	error?: AiChatMessageError
}

export type AiChatRequestData = {
	repo: AiChatRepo;
	messages: AiChatMessage[];
	onlyPrompt: boolean;
	stream: boolean;
}
