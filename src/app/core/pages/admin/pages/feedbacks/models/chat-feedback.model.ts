import { User } from 'src/app/auth/models/user.model';
import { AiChatMessageFeedback } from 'src/app/shared/models/ai-chat/ai-chat.model';

export interface ChatFeedback extends AiChatMessageFeedback {
	user?: User;
}