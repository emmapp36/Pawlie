import { Injectable } from '@nestjs/common';
import type { ChatIntent } from '@pawlie/domain';

interface Classification {
  intent: ChatIntent;
  emergency: boolean;
}

const INGESTION_VERBS = /\b(ate|eaten|swallowed|drank|licked up|got into|ingested|chewed up)\b/i;

const DANGEROUS_SUBSTANCES =
  /\b(chocolate|grapes?|raisins?|xylitol|onions?|garlic|batter(y|ies)|medication|pills?|tablets?|antifreeze|rat poison|mouse poison|mushrooms?|marijuana)\b/i;

const HARD_EMERGENCY_SIGNS: RegExp[] = [
  /\b(seizure|seizing|collapsed?|unconscious|not breathing|bleeding heavily)\b/i,
  /\bbloat(ed)?\b/i,
  /\bdistended (stomach|belly|abdomen)\b/i,
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
    const ingestedSomethingDangerous =
      INGESTION_VERBS.test(message) && DANGEROUS_SUBSTANCES.test(message);
    const hasHardEmergencySign = HARD_EMERGENCY_SIGNS.some((pattern) => pattern.test(message));

    if (ingestedSomethingDangerous || hasHardEmergencySign) {
      return { intent: 'emergency', emergency: true };
    }

    for (const [intent, pattern] of INTENT_PATTERNS) {
      if (pattern.test(message)) return { intent, emergency: false };
    }

    return { intent: 'general', emergency: false };
  }
}
