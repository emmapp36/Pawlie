export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile' | 'small_mammal';
export type Sex = 'male' | 'female' | 'unknown';

export interface Pet {
  id: string;
  householdId: string;
  name: string;
  species: Species;
  breed: string | null;
  birthDate: string | null;
  sex: Sex;
  allergies: string[];
  microchipId: string | null;
  createdAt: string;
}

export type MemoryCategory = 'health' | 'preference' | 'behavior' | 'history';
export type MemorySource = 'user_stated' | 'extracted' | 'derived';

export interface PetMemory {
  id: string;
  petId: string;
  category: MemoryCategory;
  fact: string;
  source: MemorySource;
  confirmed: boolean;
  createdAt: string;
}

export type HealthEventType =
  | 'symptom'
  | 'med'
  | 'food_change'
  | 'mood'
  | 'visit'
  | 'photo'
  | 'note';

export type Severity = 'info' | 'monitor' | 'vet_soon' | 'vet_now';

export interface HealthEvent {
  id: string;
  petId: string;
  type: HealthEventType;
  title: string;
  detail: Record<string, unknown>;
  severity: Severity;
  sourceMessageId: string | null;
  occurredAt: string;
}

export interface WeightEntry {
  id: string;
  petId: string;
  weightKg: number;
  bodyConditionScore: number | null;
  measuredAt: string;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequencyRrule: string;
  startDate: string;
  endDate: string | null;
  purpose: string | null;
  vetNotes: string | null;
  active: boolean;
}

export type DoseStatus = 'given' | 'missed' | 'skipped';

export interface DoseLog {
  id: string;
  medicationId: string;
  dueAt: string;
  status: DoseStatus;
  loggedAt: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineType: string;
  administeredOn: string;
  nextDue: string | null;
  clinic: string | null;
  lotNumber: string | null;
}

export type ChatMode = 'chat' | 'symptom' | 'food' | 'emergency' | 'behavior';

export type ChatIntent =
  | 'emergency'
  | 'symptom'
  | 'food_safety'
  | 'behavior'
  | 'training'
  | 'meds'
  | 'general'
  | 'smalltalk';

export interface ChatRequest {
  conversationId: string | null;
  message: string;
}

/**
 * Server-sent events streamed from POST /v1/pets/:id/chat.
 * Clients must render `emergency_flag` and `triage_question` distinctly;
 * they are safety affordances, not decoration.
 */
export type ChatStreamEvent =
  | { kind: 'meta'; conversationId: string; intent: ChatIntent }
  | { kind: 'token'; text: string }
  | { kind: 'triage_question'; question: string; quickReplies: string[] }
  | { kind: 'emergency_flag'; reason: string; hotline: string }
  | { kind: 'journal_suggestion'; eventType: HealthEventType; title: string }
  | { kind: 'done' };

export type FoodVerdict = 'safe' | 'caution' | 'toxic';

export interface FoodSafetyEntry {
  food: string;
  species: Species;
  verdict: FoodVerdict;
  toxicDosePerKg: string | null;
  symptoms: string[];
  alternatives: string[];
  notes: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
