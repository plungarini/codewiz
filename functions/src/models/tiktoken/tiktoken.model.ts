export enum AiChatMessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export type AiChatMessage = {
	role: AiChatMessageRole;
	content: string;
}
