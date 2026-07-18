import { Body, Controller, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PetsService } from '../pets/pets.service';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('pets/:petId/chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly petsService: PetsService,
  ) {}

  @Post()
  async chat(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: ChatRequestDto,
    @Res() response: Response,
  ): Promise<void> {
    const pet = await this.petsService.get(petId);

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    try {
      const events = this.chatService.respond(
        pet,
        dto.message,
        dto.conversationId ?? null,
      );
      for await (const event of events) {
        response.write(`event: ${event.kind}\ndata: ${JSON.stringify(event)}\n\n`);
      }
    } finally {
      response.end();
    }
  }
}
