# Pawlie

AI pet companion and health assistant — an experienced veterinary assistant in your pocket, 24/7. Pawlie remembers every pet, personalizes every answer, and always knows when to say "call your vet."

## Workspace layout

```
apps/
  web/       Next.js dashboard (App Router)
  mobile/    Expo / React Native client
  api/       NestJS backend (REST + SSE chat)
packages/
  tokens/    Soft Organic Card UI design tokens (single source of truth)
  domain/    Shared domain types and API contracts
db/
  init/      Postgres bootstrap SQL (schema + pgvector)
```

## Getting started

Requires Node 20+, Docker, and npm 10+ (workspaces).

```sh
npm install
npm run db:up          # postgres 16 + pgvector on :5432, schema auto-applied
cp apps/api/.env.example apps/api/.env

npm run dev:api        # http://localhost:4000
npm run dev:web        # http://localhost:3000
npm run dev:mobile     # Expo dev server
```

## Design system

All colors, radii, shadows, and motion values live in `packages/tokens` and are
consumed by every client — Tailwind preset on web, `StyleSheet` values on
mobile. The visual language is **Soft Organic Card UI**: elevated borderless
cards (24–32px radii, layered soft shadows), organic halo shapes behind pet
imagery, pill-shaped actionables, and a pastel mint / sage-neutral palette with
a reserved sky-blue for clinical surfaces.

## Safety posture

Pawlie is an educational care companion, not a diagnostic tool. The chat
pipeline enforces this in code: an urgency classifier runs ahead of generation,
and streamed responses carry typed safety events (`emergency_flag`,
`triage_question`) that clients must render. See `apps/api/src/chat`.
