import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { ChatViewRoutingModule } from './chat-view-routing.module';
import { ChatViewComponent } from './chat-view.component';
import { LoaderComponent } from './components/loader/loader.component';
import { AiToolbarComponent } from './components/messages/components/ai-toolbar/ai-toolbar.component';
import { MessageAvatarComponent } from './components/messages/components/message-avatar/message-avatar.component';
import { MessageToolbarComponent } from './components/messages/components/message-toolbar/message-toolbar.component';
import { PagesectionsSelectorComponent } from './components/messages/components/pagesections-selector/pagesections-selector.component';
import { MessagesComponent } from './components/messages/messages.component';
import { QueryInputComponent } from './components/query-input/query-input.component';
import { StatusComponent } from './components/status/status.component';


@NgModule({
  declarations: [
		ChatViewComponent,
		QueryInputComponent,
    MessagesComponent,
		StatusComponent,
		MessageAvatarComponent,
		AiToolbarComponent,
    PagesectionsSelectorComponent,
		MessageToolbarComponent,
  	LoaderComponent,
  ],
  imports: [
		CommonModule,
    ChatViewRoutingModule,
		MarkdownModule.forChild(),
		ReactiveFormsModule,
		ClipboardModule
  ]
})
export class ChatViewModule { }
