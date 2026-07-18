import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ChatStreamEvent, Pet } from '@pawlie/domain';
import { randomUUID } from 'node:crypto';
import { CHAT_MODEL, type ChatModel } from './chat-model';
import { UrgencyClassifier } from './urgency-classifier';

const POISON_HOTLINE = 'ASPCA Animal Poison Control: +1 (888) 426-4435';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly classifier: UrgencyClassifier,
    @Inject(CHAT_MODEL) private readonly model: ChatModel,
  ) {}

  async *respond(
    pet: Pet,
    message: string,
    conversationId: string | null,
  ): AsyncIterable<ChatStreamEvent> {
    const { intent, emergency } = this.classifier.classify(message);

    yield {
      kind: 'meta',
      conversationId: conversationId ?? randomUUID(),
      intent,
    };

    if (emergency) {
      yield* this.respondToEmergency(pet, message);
      return;
    }

    try {
      for await (const text of this.model.stream({ pet, intent, message })) {
        yield { kind: 'token', text };
      }
    } catch (error) {
      this.logger.error('Generation backend failed mid-stream', error instanceof Error ? error.stack : String(error));
      yield {
        kind: 'token',
        text:
          `Sorry — I'm having trouble thinking right now. Please try again in a ` +
          `moment. If this is urgent, don't wait for me: contact your vet.`,
      };
      yield { kind: 'done' };
      return;
    }

    if (intent === 'symptom') {
      yield {
        kind: 'triage_question',
        question: 'How long has this been going on?',
        quickReplies: ['Just today', 'A few days', 'Over a week'],
      };
      yield {
        kind: 'journal_suggestion',
        eventType: 'symptom',
        title: this.summarize(message),
      };
    }

    yield { kind: 'done' };
  }

  /**
   * Emergency mode bypasses generation entirely: short sentences, essentials
   * only, real-world help surfaced in the first response. Speed to real help
   * beats conversation.
   */
  private async *respondToEmergency(
    pet: Pet,
    message: string,
  ): AsyncIterable<ChatStreamEvent> {
    yield {
      kind: 'emergency_flag',
      reason: this.summarize(message),
      hotline: POISON_HOTLINE,
    };
    yield {
      kind: 'token',
      text:
        `This could be serious. Call your vet or an emergency clinic now — ` +
        `don't wait for symptoms. To help them act fast: how much was involved, ` +
        `and how long ago? ${pet.name}'s weight is on file and I'll include it ` +
        `in the summary.`,
    };
    yield {
      kind: 'journal_suggestion',
      eventType: 'symptom',
      title: `Emergency: ${this.summarize(message)}`,
    };
    yield { kind: 'done' };
  }

  private summarize(message: string): string {
    const trimmed = message.trim().replace(/\s+/g, ' ');
    return trimmed.length <= 80 ? trimmed : `${trimmed.slice(0, 77)}...`;
  }
}
