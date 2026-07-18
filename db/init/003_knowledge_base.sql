-- Editorial knowledge base: read-mostly, versioned, vet-reviewed content.
-- kb_chunks powers retrieval; food_safety_kb is queried directly as a
-- structured tool call whose verdict is binding on generation.

CREATE TABLE food_safety_kb (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food              text NOT NULL,
  species           text NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'small_mammal')),
  verdict           text NOT NULL CHECK (verdict IN ('safe', 'caution', 'toxic')),
  toxic_dose_per_kg text,
  symptoms          jsonb NOT NULL DEFAULT '[]',
  alternatives      jsonb NOT NULL DEFAULT '[]',
  notes             text NOT NULL DEFAULT '',
  sources           jsonb NOT NULL DEFAULT '[]',
  reviewed_at       timestamptz,
  UNIQUE (food, species)
);

CREATE INDEX food_safety_lookup_idx ON food_safety_kb(lower(food), species);

CREATE TABLE breed_kb (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species          text NOT NULL,
  breed            text NOT NULL,
  profile          jsonb NOT NULL,
  reviewed_at      timestamptz,
  UNIQUE (species, breed)
);

CREATE TABLE kb_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  topic       text NOT NULL,
  species     text[],
  body        text NOT NULL,
  version     int NOT NULL DEFAULT 1,
  reviewed_at timestamptz
);

CREATE TABLE kb_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES kb_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  content     text NOT NULL,
  embedding   vector(1536) NOT NULL,
  UNIQUE (document_id, chunk_index)
);

-- IVFFlat needs data present before the index is useful; lists=100 suits the
-- initial corpus size and gets revisited once the KB passes ~100k chunks.
CREATE INDEX kb_chunks_embedding_idx
  ON kb_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE pet_memory_embeddings (
  memory_id uuid PRIMARY KEY REFERENCES pet_memories(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL
);
