import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ImgixAngularModule } from '@imgix/angular';
import { MarkdownModule } from 'ngx-markdown';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { SearchRepoAutocompleteComponent } from './components/chat-sidebar/components/search-repo-autocomplete/search-repo-autocomplete.component';
import { AiToolbarComponent } from './components/messages/components/ai-toolbar/ai-toolbar.component';
import { MessageAvatarComponent } from './components/messages/components/message-avatar/message-avatar.component';
import { MessageToolbarComponent } from './components/messages/components/message-toolbar/message-toolbar.component';
import { PagesectionsSelectorComponent } from './components/messages/components/pagesections-selector/pagesections-selector.component';
import { MessagesComponent } from './components/messages/messages.component';
import { QueryInputComponent } from './components/query-input/query-input.component';
import { StatusComponent } from './components/status/status.component';
import { ChatsHistoryComponent } from './components/chat-sidebar/components/chats-history/chats-history.component';



@NgModule({
	declarations: [
		ChatComponent,
    QueryInputComponent,
    MessagesComponent,
    StatusComponent,
		MessageAvatarComponent,
		AiToolbarComponent,
    PagesectionsSelectorComponent,
    MessageToolbarComponent,
    ChatSidebarComponent,
    SearchRepoAutocompleteComponent,
    ChatsHistoryComponent,
  ],
  imports: [
		CommonModule,
		ChatRoutingModule,
		ReactiveFormsModule,
		MarkdownModule.forChild(),
		ImgixAngularModule,
		ReactiveFormsModule
  ],
})
export class ChatModule { }
