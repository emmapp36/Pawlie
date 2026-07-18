import { Injectable } from '@nestjs/common';
import type { ChatIntent } from '@pawlie/domain';

interface Classification {
  intent: ChatIntent;
  emergency: boolean;
}

const EMERGENCY_PATTERNS: RegExp[] = [
  /\bate (a |some |the )?(chocolate|grape|raisin|xylitol|onion|battery|medication|pills?)\b/i,
  /\b(drank|swallowed|ingested)\b/i,
  /\b(seizure|collapsed?|unconscious|not breathing|bleeding heavily|bloat(ed)?)\b/i,
  /\bhit by (a )?car\b/i,
  /\bpoison(ed|ing)?\b/i,
];

const INTENT_PATTERNS: Array<[ChatIntent, RegExp]> = [
  ['food_safety', /\b(can|is it (safe|ok(ay)?)).*(eat|food|feed)\b/i],
  ['food_safety', /\beat\b.*\?/i],
  ['symptom', /\b(limp(ing)?|vomit(ing)?|threw up|scratch(ing)?|diarrhea|cough(ing)?|sneez(e|ing)|lethargic|not eating|hiding)\b/i],
  ['meds', /\b(medication|medicine|dose|dosage|pill|tablet)\b/i],
  ['training', /\b(train(ing)?|teach|command|leash|recall|crate)\b/i],
  ['behavior', /\b(bark(ing)?|bit(e|ing)|chew(ing)?|anxiety|aggressi(ve|on)|meow(ing)?|dig(ging)?)\b/i],
];

/**
 * Deterministic first-pass triage. Runs on every inbound message before any
 * model call; an emergency match preempts the rest of the pipeline. The
 * hosted classifier model replaces the pattern table behind the same
 * interface — recall is tuned first, false positives second.
 */
@Injectable()
export class UrgencyClassifier {
  classify(message: string): Classification {
    if (EMERGENCY_PATTERNS.some((pattern) => pattern.test(message))) {
      return { intent: 'emergency', emergency: true };
    }

    for (const [intent, pattern] of INTENT_PATTERNS) {
      if (pattern.test(message)) return { intent, emergency: false };
    }

    return { intent: 'general', emergency: false };
  }
}
