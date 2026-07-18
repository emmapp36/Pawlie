import { Injectable } from '@nestjs/common';
import type { ChatModel, ChatModelRequest } from './chat-model';

const RESPONSES: Record<string, (petName: string) => string> = {
  symptom: (name) =>
    `Let's figure out what's going on with ${name}. When did you first notice this, ` +
    `and has anything changed about appetite or energy since then? While we narrow it ` +
    `down: if you see collapse, repeated vomiting, or laboured breathing, skip me and ` +
    `call your vet right away.`,
  food_safety: (name) =>
    `Good instinct to check before sharing with ${name}. Tell me the exact food and ` +
    `roughly how much, and I'll walk you through whether it's safe at ${name}'s size.`,
  general: (name) =>
    `Happy to help with anything about ${name} — health questions, behaviour, ` +
    `training, or day-to-day care. What's on your mind?`,
};

/**
 * Development-mode generation backend: deterministic, instant, and offline.
 * Keeps the SSE contract exercisable end-to-end without model credentials.
 */
@Injectable()
export class ScriptedChatModel implements ChatModel {
  async *stream(request: ChatModelRequest): AsyncIterable<string> {
    const template = RESPONSES[request.intent] ?? RESPONSES.general!;
    for (const word of template(request.pet.name).split(' ')) {
      yield `${word} `;
    }
  }
}
