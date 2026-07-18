-- Idempotent dev seed: fixed UUIDs so the web app can reference a stable
-- demo pet without a login flow. Safe to re-run.

INSERT INTO households (id, name, plan)
VALUES ('11111111-1111-1111-1111-111111111111', 'Appiah household', 'free')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pets (id, household_id, name, species, breed, birth_date, sex, allergies)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Biscuit',
  'dog',
  'Golden Retriever',
  '2025-04-10',
  'male',
  '["chicken"]'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO weight_entries (pet_id, weight_kg, body_condition_score, measured_at)
SELECT '22222222-2222-2222-2222-222222222222', w.kg, w.bcs, w.measured_at
FROM (VALUES
  (24.1::numeric, 5.0::numeric, now() - interval '60 days'),
  (25.9::numeric, 5.5::numeric, now() - interval '30 days'),
  (26.7::numeric, 6.0::numeric, now() - interval '2 days')
) AS w(kg, bcs, measured_at)
WHERE NOT EXISTS (
  SELECT 1 FROM weight_entries
   WHERE pet_id = '22222222-2222-2222-2222-222222222222'
);
