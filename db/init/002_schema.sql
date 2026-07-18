CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  name          text NOT NULL,
  auth_provider text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE households (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium'))
);

CREATE TABLE household_members (
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  PRIMARY KEY (user_id, household_id)
);

CREATE TABLE pets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name         text NOT NULL,
  species      text NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'small_mammal')),
  breed        text,
  birth_date   date,
  sex          text NOT NULL DEFAULT 'unknown' CHECK (sex IN ('male', 'female', 'unknown')),
  allergies    jsonb NOT NULL DEFAULT '[]',
  microchip_id text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pets_household_idx ON pets(household_id);

CREATE TABLE pet_memories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  category   text NOT NULL CHECK (category IN ('health', 'preference', 'behavior', 'history')),
  fact       text NOT NULL,
  source     text NOT NULL CHECK (source IN ('user_stated', 'extracted', 'derived')),
  confirmed  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pet_memories_pet_idx ON pet_memories(pet_id);

CREATE TABLE conversations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode       text NOT NULL DEFAULT 'chat' CHECK (mode IN ('chat', 'symptom', 'food', 'emergency', 'behavior')),
  started_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX conversations_pet_idx ON conversations(pet_id, started_at DESC);

CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text NOT NULL,
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id, created_at);

CREATE TABLE health_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id            uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type              text NOT NULL CHECK (type IN ('symptom', 'med', 'food_change', 'mood', 'visit', 'photo', 'note')),
  title             text NOT NULL,
  detail            jsonb NOT NULL DEFAULT '{}',
  severity          text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'monitor', 'vet_soon', 'vet_now')),
  source_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  occurred_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX health_events_pet_idx ON health_events(pet_id, occurred_at DESC);

CREATE TABLE weight_entries (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id               uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_kg            numeric(6,3) NOT NULL CHECK (weight_kg > 0),
  body_condition_score numeric(3,1) CHECK (body_condition_score BETWEEN 1 AND 9),
  measured_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weight_entries_pet_idx ON weight_entries(pet_id, measured_at DESC);

CREATE TABLE medications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name            text NOT NULL,
  dosage          text NOT NULL,
  frequency_rrule text NOT NULL,
  start_date      date NOT NULL,
  end_date        date,
  purpose         text,
  vet_notes       text,
  active          boolean NOT NULL DEFAULT true
);

CREATE INDEX medications_pet_idx ON medications(pet_id) WHERE active;

CREATE TABLE dose_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  due_at        timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('given', 'missed', 'skipped')),
  logged_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vaccinations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_type    text NOT NULL,
  administered_on date NOT NULL,
  next_due        date,
  clinic          text,
  lot_number      text
);

CREATE INDEX vaccinations_due_idx ON vaccinations(pet_id, next_due);

CREATE TABLE reminders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id       uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('med', 'vaccine', 'checkup', 'custom')),
  title        text NOT NULL,
  rrule        text NOT NULL,
  next_fire_at timestamptz,
  enabled      boolean NOT NULL DEFAULT true
);

CREATE INDEX reminders_fire_idx ON reminders(next_fire_at) WHERE enabled;
