import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { QueryInputComponent } from './components/query-input/query-input.component';
import { MessagesComponent } from './components/messages/messages.component';
import { StatusComponent } from './components/status/status.component';



@NgModule({
	declarations: [
		ChatComponent,
    QueryInputComponent,
    MessagesComponent,
    StatusComponent
  ],
  imports: [
		CommonModule,
		ChatRoutingModule,
		ReactiveFormsModule
  ]
})
export class ChatModule { }
