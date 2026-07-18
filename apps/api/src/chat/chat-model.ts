import type { ChatIntent, Pet } from '@pawlie/domain';

export const CHAT_MODEL = Symbol('CHAT_MODEL');

export interface ChatModelRequest {
  pet: Pet;
  intent: ChatIntent;
  message: string;
}

/**
 * Boundary for the generation backend. The production implementation calls
 * the Claude API with the layered system prompt (identity, safety, pet
 * context, mode playbook, retrieved evidence); binding a different provider
 * is a one-line change in ChatModule.
 */
export interface ChatModel {
  stream(request: ChatModelRequest): AsyncIterable<string>;
}
