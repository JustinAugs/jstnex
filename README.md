# JSTNEX

**Global Supply Network Intelligence**
_Mapping How The World Moves._

JSTNEX is an independent student project exploring how global trade, logistics,
ports, companies and supply networks connect the world.

Status: **V1.0 MVP — TASK 01 complete (project scaffolding + layout + Home skeleton)**

## Tech stack

| Layer    | Choice                                  |
| -------- | --------------------------------------- |
| Frontend | Next.js 16 (App Router) + React 19      |
| Language | TypeScript                              |
| Styling  | Tailwind CSS v4                         |
| Backend  | Next.js API / server functions (V1)     |
| Data     | JSON + TypeScript objects (V1)          |

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

## Data policy

Sample figures used for layout are marked `Demo Data` in the UI. Any real data
must record source, URL and date.
