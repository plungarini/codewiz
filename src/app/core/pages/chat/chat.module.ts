import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatsHistoryComponent } from './components/chat-sidebar/components/chats-history/chats-history.component';



@NgModule({
	declarations: [
		ChatComponent,
    ChatSidebarComponent,
    ChatsHistoryComponent,
  ],
  imports: [
		CommonModule,
		ChatRoutingModule,
		ReactiveFormsModule,
		SharedModule,
  ],
})
export class ChatModule { }
