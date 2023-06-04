import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { MessageAvatarComponent } from './components/messages/components/message-avatar/message-avatar.component';
import { MessageToolbarComponent } from './components/messages/components/message-toolbar/message-toolbar.component';
import { PagesectionsSelectorComponent } from './components/messages/components/pagesections-selector/pagesections-selector.component';
import { MessagesComponent } from './components/messages/messages.component';
import { QueryInputComponent } from './components/query-input/query-input.component';
import { StatusComponent } from './components/status/status.component';



@NgModule({
	declarations: [
		ChatComponent,
    QueryInputComponent,
    MessagesComponent,
    StatusComponent,
    MessageAvatarComponent,
    MessageToolbarComponent,
    PagesectionsSelectorComponent,
  ],
  imports: [
		CommonModule,
		ChatRoutingModule,
		ReactiveFormsModule,
		MarkdownModule.forChild(),
  ],
})
export class ChatModule { }
