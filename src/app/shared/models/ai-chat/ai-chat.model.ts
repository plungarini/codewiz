import { Timestamp } from '@angular/fire/firestore';

export enum AiChatMessageRole {
  User = 'user',
  Assistant = 'assistant',
}

type AiChatMessageError = {
	message?: string;
	debug?: {
		type?: string;
		message?: string;
	}
}

type AiChatPageSection = {
	title: string;
	id: string;
}

export interface AiChatMessageFeedback extends AiChatMessage {
	prompt?: string;
}

export interface AiChatMessage extends AiChatMessageReqItem  {
	hide?: boolean;
	id?: string;
	chatId?: string;
	repoId?: string;
	completed: boolean;
	pageSections?: AiChatPageSection[];
	feedback?: 'like' | 'dislike' | 'none';
	showPageSections?: boolean;
	error?: AiChatMessageError;
	updatedAt?: Timestamp;
	createdAt?: Timestamp;
}

type AiChatMessageReqItem = {
	role: AiChatMessageRole;
	content: string;
}

export type AiChatRequestData = {
	repo: string;
	messages: AiChatMessageReqItem[];
	onlyPrompt: boolean;
	stream: boolean;
}

export type AiChatTitleRequestData = {
	messages: AiChatMessageReqItem[];
	stream: boolean;
}

type AiChatFinishReason = 'stop' | 'length' | 'function_call' | 'content_filter' | null;

export type AiChatTitleResponseData = {
	completion: string;
	shouldUpdate: boolean;
	finishReason?: AiChatFinishReason;
}

export type PageSection = {
	id: string;
	title: string;
};

export type AiChatResponseData = {
	completion: string;
	pageSections: PageSection[];
	finishReason?: AiChatFinishReason;
}

// TODO: Replace with proper type
export type AiUserRepoChat = any;
