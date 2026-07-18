import { Module } from '@nestjs/common';
import { PetsModule } from '../pets/pets.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CHAT_MODEL } from './chat-model';
import { ScriptedChatModel } from './scripted-chat-model';
import { UrgencyClassifier } from './urgency-classifier';

@Module({
  imports: [PetsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    UrgencyClassifier,
    { provide: CHAT_MODEL, useClass: ScriptedChatModel },
  ],
})
export class ChatModule {}
