# JSTNEX

**Global Supply Network Intelligence**
_Mapping How The World Moves._

JSTNEX is an independent student project exploring how global trade, logistics,
ports, companies and supply networks connect the world.

Status: **V1.0 MVP — Foundation phase (through TASK 02.9)**

## Tech stack

| Layer    | Choice                                  |
| -------- | --------------------------------------- |
| Frontend | Next.js 16 (App Router) + React 19      |
| Language | TypeScript                              |
| Styling  | Tailwind CSS v4                         |
| Backend  | Next.js API / server functions (V1)     |
| Data     | JSON files loaded through `lib/data`    |

Planned for later versions: Python FastAPI, PostgreSQL, Recharts, crawler.

## Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

Other commands:

```bash
npm run build   # production build (also runs type checking)
npm run lint    # ESLint
```

> Note: on this machine Next.js telemetry writes to `~/Library/Preferences`, which
> is blocked in some sandboxes. If a command fails with `EPERM`, prefix it with
> `NEXT_TELEMETRY_DISABLED=1`, e.g. `NEXT_TELEMETRY_DISABLED=1 npm run dev`.

## Brand rules

- Palette: black, white, dark gray, and **deep blue only** for links, buttons,
  data highlights and interactive states. No large colour gradients.
- Logo: wordmark `JSTNEX` (geometric, modern, generous letter-spacing).
- All non-authoritative numbers must be labelled **Demo Data**.

## Structure

```
app/
  layout.tsx        root layout (Navbar + Footer + metadata)
  page.tsx          Home
  global/           GLOBAL NETWORK
  supply-chain/     SUPPLY CHAIN knowledge base
  companies/        company profiles
  tools/            calculators
components/
  Navbar.tsx  Footer.tsx  Hero.tsx  SectionHeading.tsx  DataCard.tsx
```

Directories planned for upcoming tasks: `data/` (countries.json, companies.json,
supply-chain.json), `lib/` (utils.ts, calculations.ts), `public/`, `crawler/`.

## Environment variables

Nothing is needed for V1.0. When a key becomes necessary (V2 database, V3 AI,
external data APIs), do this once:

```bash
cp .env.example .env.local
```

Then put real values in `.env.local` only.

### Security rules (non-negotiable)

- Real keys, tokens, passwords and database URLs live **only** in `.env.local`,
  which is git-ignored. Never in `app/`, `components/`, `data/*.json`, or
  screenshots.
- Variables prefixed `NEXT_PUBLIC_` are bundled into the browser and readable by
  anyone who opens devtools. Use the prefix only for genuinely public values
  (e.g. the site URL). Real secrets never get the prefix — they then stay on the
  server side.
- This repository is **Public**. Assume anything committed is permanent.

## Data policy

Sample figures used for layout are marked `Demo Data` in the UI. Any real data
must record source, URL and date.
