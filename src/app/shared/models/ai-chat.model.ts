export enum AiChatMessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum AiChatRepo {
	Angular = 'angular/angular'
}

export interface AiChatMessage {
  role: AiChatMessageRole
  content: string
}

export interface AiChatRequestData {
	repo: AiChatRepo;
	messages: AiChatMessage[];
	onlyPrompt: boolean;
	stream: boolean;
}