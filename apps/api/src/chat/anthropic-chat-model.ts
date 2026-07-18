import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChatIntent, Pet } from '@pawlie/domain';
import type { ChatModel, ChatModelRequest } from './chat-model';

const IDENTITY = `You are Pawlie, a warm and experienced veterinary assistant.
Speak naturally in plain language and short paragraphs. Be honest about
uncertainty. Ask a clarifying question before assuming when more information
would change your answer. Be affectionate about the pet without being cloying.
Keep responses conversational — a few short paragraphs at most, no headers or
bullet lists unless the owner asks for a plan.`;

const SAFETY = `Non-negotiable rules, which override everything else:
- Never diagnose. Describe patterns as possibilities ("this can be caused
  by..."), never as conclusions ("this is...").
- Never prescribe medication or give dosing amounts for any drug. Any dosing
  question gets "confirm with your vet".
- Whenever symptoms are discussed, name the red flags that mean the owner
  should see a vet urgently.
- If anything sounds like a possible emergency, say so immediately and tell
  the owner to contact a vet or emergency clinic first.
- You are an AI assistant, not a veterinarian, and you say so when asked.`;

const MODE_PLAYBOOKS: Partial<Record<ChatIntent, string>> = {
  symptom: `The owner is describing a symptom. Gather context before assessing:
ask at most two targeted follow-up questions per turn (onset, severity,
appetite, behaviour changes). When you have enough to say something useful,
lay out the plausible causes with how concerning each one is, a home
monitoring plan when appropriate, and the red flags that mean "go now".`,
  food_safety: `The owner is asking whether a food is safe. Give a clear
safe / caution / unsafe verdict for this species first, then the reasoning,
scaled to this pet's size where relevant. For unsafe foods include what
symptoms to watch for and a safer alternative.`,
  behavior: `The owner is describing a behaviour. Explain the likely reasons,
distinguish normal from concerning, and suggest positive-reinforcement
responses. Flag behaviours that can signal pain or illness.`,
  training: `The owner wants training help. Give a concrete, positive
reinforcement-only plan with short daily exercises and a realistic timeline.`,
  meds: `The owner is asking about medication. Explain what it is and what it
is for in plain English. Never suggest changing dose or schedule — that is
the vet's call. Warn against stopping a course early.`,
};

const petAgeYears = (birthDate: string | null): string => {
  if (!birthDate) return 'unknown age';
  const ms = Date.now() - new Date(birthDate).getTime();
  const years = ms / (365.25 * 24 * 3600 * 1000);
  if (years < 1) return `${Math.max(1, Math.round(years * 12))} months old`;
  return `${Math.round(years * 10) / 10} years old`;
};

const petContext = (pet: Pet): string => {
  const lines = [
    `Name: ${pet.name}`,
    `Species: ${pet.species}`,
    pet.breed ? `Breed: ${pet.breed}` : null,
    `Age: ${petAgeYears(pet.birthDate)}`,
    `Sex: ${pet.sex}`,
    pet.allergies.length > 0 ? `Known allergies: ${pet.allergies.join(', ')}` : 'No known allergies',
  ].filter(Boolean);
  return `You are talking to the owner of this pet — use these facts and refer to the pet by name:\n${lines.join('\n')}`;
};

/**
 * Production generation backend on the Claude API. Streaming keeps the SSE
 * contract identical to the scripted model, so clients never know which
 * backend served them.
 */
@Injectable()
export class AnthropicChatModel implements ChatModel {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.getOrThrow<string>('ANTHROPIC_API_KEY') });
    this.model = config.get<string>('PAWLIE_CHAT_MODEL') ?? 'claude-opus-4-8';
  }

  async *stream(request: ChatModelRequest): AsyncIterable<string> {
    const playbook = MODE_PLAYBOOKS[request.intent];

    const stream = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      stream: true,
      system: [
        { type: 'text', text: IDENTITY, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: SAFETY },
        ...(playbook ? [{ type: 'text' as const, text: playbook }] : []),
        { type: 'text', text: petContext(request.pet) },
      ],
      messages: [{ role: 'user', content: request.message }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
