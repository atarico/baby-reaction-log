# baby reactions

Log how a baby reacts to a stimulus — cold water, light, touch, sound, feeding —
with the exact time it happened. Built for one-handed use in a dark room.

**The interface is in Spanish.** Code, identifiers and this document stay in
English; user-facing copy lives in the UI layer and in the `STIMULI` catalog.

Everything is stored **locally in the browser** (IndexedDB). No account, no
backend, no network. It works offline and the data never leaves the device.

## Commands

```bash
pnpm install
pnpm dev        # development server
pnpm test       # unit tests (Vitest)
pnpm build      # typecheck + production bundle
pnpm lint       # oxlint
```

## Using it

- **Tap a stimulus** in the bottom pad. The movement is saved at the current
  time *immediately*, and only then does a dialog ask for the **detail** — what
  actually happened, in your own words. Skipping keeps the bare entry, so the
  timestamp is never at risk.
- **`Otro`** shows two fields instead of one: the **action** (the stimulus the
  catalog does not list) and the **detail**.
- **⋯ → Registrar un movimiento anterior** to record something that happened
  earlier, with the same fields.
- **⋯ → Exportar CSV / JSON** to hand the log to a pediatrician or to back it up.
  The CSV keeps machine-stable English headers and stimulus ids:
  `id,occurred_at,stimulus,action,detail`.
- **✕** on a row deletes it.

## Deploying

Any static host works — `pnpm build` emits a plain `dist/`. Vercel needs no
configuration: the app is a single page with no client-side router, so there is
nothing to rewrite.

The app is installable ("add to home screen", fullscreen, offline). That needs
**HTTPS**, which any real deployment provides but `localhost` aside, plain HTTP
does not:

- `public/manifest.webmanifest` — `display: standalone`, plus 192×192 and
  512×512 PNG icons, which Chromium requires before it offers to install.
- `public/apple-touch-icon.png` — 180×180, **opaque PNG**. iOS ignores SVG here
  and fills any transparency with black.
- `public/sw.js` — registered in production only; caches the app shell so it
  boots with no connection.

## Architecture

Hexagonal, one module per business capability:

```
src/modules/movements/
├── domain/            # Movement, Stimulus catalog, grouping, repository port
├── application/       # use cases: register, list, delete, export
├── infrastructure/    # IndexedDB and in-memory adapters for the port
├── ui/                # container + presentational components, hooks, formatters
└── movementsModule.ts # composition root: the only place adapters are chosen
```

The domain knows nothing about React or IndexedDB. `MovementRepository` is the
port; swapping IndexedDB for a remote API means writing one adapter and editing
`movementsModule.ts`.

### Caveats worth knowing

- Data lives in **one browser on one device**. Clearing site data wipes the log —
  export the JSON backup regularly.
- Timestamps are stored in UTC (ISO 8601) and rendered in the device's local
  timezone. Tests are pinned to `America/Argentina/Buenos_Aires` so timezone
  behaviour stays deterministic.
- A movement cannot be logged in the future; the domain rejects it.
