import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { QueryInputComponent } from './components/query-input/query-input.component';



@NgModule({
	declarations: [
		ChatComponent,
    QueryInputComponent
  ],
  imports: [
		CommonModule,
		ChatRoutingModule
  ]
})
export class ChatModule { }
