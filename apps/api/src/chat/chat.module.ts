import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PetsModule } from '../pets/pets.module';
import { AnthropicChatModel } from './anthropic-chat-model';
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
    {
      provide: CHAT_MODEL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger(ChatModule.name);
        if (config.get<string>('ANTHROPIC_API_KEY')) {
          const model = config.get<string>('PAWLIE_CHAT_MODEL') ?? 'claude-opus-4-8';
          logger.log(`Chat generation: Claude API (${model})`);
          return new AnthropicChatModel(config);
        }
        logger.warn(
          'ANTHROPIC_API_KEY not set — chat is running on the scripted offline model. ' +
            'Add the key to apps/api/.env for real responses.',
        );
        return new ScriptedChatModel();
      },
    },
  ],
})
export class ChatModule {}
