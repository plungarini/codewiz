import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ImgixAngularModule } from '@imgix/angular';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatsHistoryComponent } from './components/chat-sidebar/components/chats-history/chats-history.component';
import { SearchRepoAutocompleteComponent } from './components/chat-sidebar/components/search-repo-autocomplete/search-repo-autocomplete.component';



@NgModule({
	declarations: [
		ChatComponent,
    ChatSidebarComponent,
    SearchRepoAutocompleteComponent,
    ChatsHistoryComponent,
  ],
  imports: [
		CommonModule,
		ChatRoutingModule,
		ReactiveFormsModule,
		ImgixAngularModule,
  ],
})
export class ChatModule { }
