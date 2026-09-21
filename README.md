# JSTNEX

**Global Supply Network Intelligence**
_Mapping How The World Moves._

JSTNEX is an independent, long-term student project about how the physical world
is connected: trade routes, ports, shipping lanes, factories, warehouses and the
companies that move goods between them.

It is built in public, one task at a time, by one student learning to code.

> **Current status:** Foundation complete. Only the **Home** page is real.
> `/global`, `/supply-chain`, `/companies` and `/tools` are placeholders that
> will be built in TASK 03–06. Every number shown today is **Demo Data**.

---

## About

Most people meet "supply chain" as a headline: a port is congested, a chip is
short, a shipping rate triples. What is missing is the layer underneath — where
the flows actually go, which nodes matter, and how a disruption in one place
shows up somewhere else weeks later.

JSTNEX is an attempt to build that layer as a product: a place where global
supply networks can be **seen** (maps and flows), **read** (a knowledge base),
**looked up** (company and country profiles) and **calculated** (simple, honest
tools).

The scope is deliberately narrow at the start. V1.0 is five pages and no
backend. The point is to get the structure right before adding weight.

## Why I'm building this

Two reasons, both honest.

1. **To understand supply chains better.** I study Supply Chain Management. Reading
   about a concept is one thing; having to model it — decide what a "port" is,
   what fields it has, how it links to a country — forces a much sharper
   understanding.
2. **To learn how to build software properly.** Not by following tutorials, but by
   carrying one real project from empty folder to something people can use. Next.js,
   TypeScript, data modelling, Git, documentation, deployment — learned by needing
   them, not by reading about them.

Because it is a learning project, the repository is intentionally explicit:
comments explain *why* a file exists, and the commit history is a readable
diary rather than a pile of "fix" commits.

## Tech stack

| Layer        | Choice                                        | Status   |
| ------------ | --------------------------------------------- | -------- |
| Framework    | Next.js 16 (App Router)                       | In use   |
| UI library   | React 19                                      | In use   |
| Language     | TypeScript (strict)                           | In use   |
| Styling      | Tailwind CSS v4 (tokens in `app/globals.css`) | In use   |
| Data (V1)    | JSON files loaded through `lib/data`          | In use   |
| i18n         | Custom EN/ZH dictionary in `lib/i18n`         | In use   |
| Charts       | Recharts                                      | Planned  |
| Backend      | Python + FastAPI                              | Planned  |
| Database     | PostgreSQL                                    | Planned  |
| Data collection | Python crawlers                            | Planned  |
| AI layer     | RAG over curated supply-chain sources         | Planned  |

**Planned** means: not installed, not decided in detail. Dependencies are added
only when a task actually needs them.

## Current features

Built and working today:

- **Home page** — hero, global snapshot, network entry points, insights,
  featured companies, tools.
- **Bilingual UI (EN / ZH)** — every visible string comes from `lib/i18n/en.ts`.
  `zh.ts` is type-checked against it, so a missing translation is a build error,
  not a silent blank. Language is remembered in `localStorage`.
- **Design system** — colour tokens, a `clamp()` type scale and spacing
  utilities defined once in `app/globals.css`. Black / white / grey, with deep
  blue reserved for links, buttons, data highlights and interactive states.
- **Component system**, organised by responsibility:
  `components/ui` (primitives) → `components/cards` (business cards) →
  `components/layout` (navbar, footer) → `components/home` (page sections).
- **Typed data layer** — content lives in `data/*.json`, is typed by
  `lib/data/types.ts` and exported by `lib/data/index.ts`. Swapping JSON for an
  API later means changing one file, not every page.
- **State components** — one consistent loading / empty / error treatment
  (`components/ui/StateBlock.tsx`) instead of ad-hoc messages.
- **SEO foundation** — page metadata via `lib/seo.ts`, plus a generated
  Open Graph image (`app/opengraph-image.tsx`).

Not built yet: real pages under `/global`, `/supply-chain`, `/companies`,
`/tools`; any real dataset; any chart; any backend.

## Project structure

```
app/
  layout.tsx              root layout: Navbar + Footer + metadata
  page.tsx                Home (the only complete page)
  globals.css             design tokens and type scale
  opengraph-image.tsx     generated social share image
  icon.svg                favicon
  global/ supply-chain/ companies/ tools/   placeholders for TASK 03–06
components/
  ui/         primitives: Button, Card, Badge, Input, Section, SectionHeader,
              DemoBadge, LanguageSwitcher, StateBlock
  cards/      DataCard, NetworkCard, InsightCard, CompanyCard, ToolCard
  layout/     Navbar, Footer
  providers/  LanguageProvider
  home/       Hero
lib/
  i18n/       en.ts (source of truth), zh.ts, index.ts, languageStore.ts
  data/       types.ts, index.ts  — typed access to data/*.json
  seo.ts      metadata helper
data/
  snapshot.json networks.json insights.json companies.json tools.json countries.json
```

## Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build   # production build (also type-checks)
npm run lint    # ESLint
```

Requires Node.js 20+.

> **Sandbox note:** Next.js telemetry writes to `~/Library/Preferences`, which is
> blocked in some sandboxes. The scripts above already set
> `NEXT_TELEMETRY_DISABLED=1`. If you run `next` directly and hit `EPERM`, prefix
> the command yourself.

### Environment variables

Nothing is required for V1.0. When a key becomes necessary (V2 database, V3 AI,
external APIs):

```bash
cp .env.example .env.local
```

Put real values in `.env.local` only — it is git-ignored.

## Brand rules

- Palette: black, white, grey. **Deep blue `#0a2f5c` only** for links, buttons,
  data highlights and interactive states. No large colour gradients, no emoji,
  nothing playful.
- Logo: the wordmark `JSTNEX`, generous letter-spacing.
- Restraint over decoration. If a visual element does not carry information, it
  does not belong on the page.

## Data policy

Numbers used for layout are **Demo Data** and are labelled as such in the UI.
Nothing on the site should ever look authoritative unless it is.

When real data arrives, every record must carry three things: **source, URL and
date**. A number without a source is not data, it is decoration.

## Security rules (non-negotiable)

- Real keys, tokens, passwords and database URLs live **only** in `.env.local`,
  which is git-ignored. Never in `app/`, `components/`, `data/*.json`, or
  screenshots.
- `NEXT_PUBLIC_` variables are bundled into the browser and readable by anyone.
  Use the prefix only for genuinely public values. Real secrets never get it.
- This repository is **Public**. Assume anything committed is permanent.

## Roadmap

| Task | Goal                                                | Status      |
| ---- | --------------------------------------------------- | ----------- |
| 01   | Project skeleton, Git, deploy pipeline              | Done        |
| 02   | Home page                                           | Done        |
| 02.5–02.12 | Foundation: i18n, design system, components, data layer, SEO, docs | Done |
| 03   | **Global** — country / region view                  | Next        |
| 04   | **Supply Chain** — knowledge base                   | Planned     |
| 05   | **Companies** — company profiles                    | Planned     |
| 06   | **Tools** — calculators (landed cost, lead time…)   | Planned     |
| 07   | Data layer normalisation (shared types, validation) | Planned     |
| 08   | Python crawlers for real datasets                   | Planned     |
| 09   | PostgreSQL + FastAPI backend                        | Planned     |
| 10   | Data visualisation (charts, maps)                   | Planned     |
| 11   | AI layer (RAG over curated sources)                 | Planned     |

TASK 03–06 complete the **V1.0 MVP**. Each task ends with one commit on `main`.

## Long-term vision

Three horizons:

- **V1 (now) — Structure.** A static, fast, bilingual site that proves the
  information architecture works. Data is hand-curated and clearly marked.
- **V2 — Real data.** A Python + PostgreSQL backend replaces JSON files. Crawlers
  collect port, route and company data on a schedule. Charts and maps make the
  networks legible.
- **V3 — Intelligence.** Ask a question in plain language and get an answer
  grounded in the project's own curated corpus, with sources attached.

The through-line is the same at every stage: **make the invisible structure of
global trade visible, and never present uncertainty as fact.**

## Author

贾桐 (Justin) — Supply Chain Management, Nanjing University of Information
Science & Technology.

Built with NEX. Detailed history lives in [CHANGELOG.md](./CHANGELOG.md).
