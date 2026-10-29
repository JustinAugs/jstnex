# JSTNEX

**Global Supply Network Intelligence**
_Mapping How The World Moves._

JSTNEX is an independent, long-term student project about how the physical world
is connected: trade routes, ports, shipping lanes, factories, warehouses and the
companies that move goods between them.

It is built in public, one task at a time, by one student learning to code.

> **Current status:** The five-page MVP is complete. **v0.8.0** adds shared
> data types and controlled values, a repeatable data validator, conditional
> source display on concept cards and country details, stable region ordering,
> and a data maintenance guide. Content remains manually curated; no real data
> acquisition or new statistical claims are included. Deployment evidence is
> recorded separately from local acceptance. Calculators are teaching models.

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

The scope is deliberately narrow at the start. The V1 stage is five pages and
no backend. The point is to get the structure right before adding weight.

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

- **Home page** — hero with an **interactive network globe** (hover, click or
  keyboard-focus a country node to open its summary card; the card links to
  the country detail page), global snapshot, network entry points, insights,
  featured companies, tools.
- **Global page** (`/global`) — a directory of the economies that shape how
  goods move. Each country records its role in the network, key ports, main
  exports, its structural strength and its main vulnerability. Filter by
  region. Each card links to a **country detail page** (`/global/[code]`,
  e.g. `/global/cn`) with the full profile.
- **Supply Chain page** (`/supply-chain`) — a knowledge base of supply chain
  concepts. Seven SCOR Digital Standard processes set the frame; each concept
  records what it is, why it matters, how it is measured and which process it
  belongs to. Filter by topic.
- **Companies page** (`/companies`) — a supply-chain-oriented company directory.
  It answers *who* participates in global supply networks: each company records
  its industry, region and **supply chain role** (brand / system integrator,
  manufacturer, supplier, logistics provider, retailer, technology provider,
  raw material / energy), plus key activities, its supply chain strength and its
  supply chain risk. Searchable, filterable by industry / region / role.
  Company entries are qualitative observations — no revenue, market share,
  ranking or performance figures.
- **Tools page** (`/tools`) — four inventory calculators: **EOQ**, **Safety
  Stock**, **Reorder Point** and **Inventory Turnover**. Each one shows its
  formula and assumptions, separates input validation from calculation, and
  never displays `NaN` or `Infinity`. EOQ / safety stock / reorder point show
  both the exact value and an optional integer reference; turnover shows the
  ratio only. A shared formula source (`lib/formulas.ts`) keeps the concept
  library and the calculators on the same definition.
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

Not built yet: concept detail pages; company detail pages; any real dataset;
any chart; any backend.

## Project structure

```
app/
  layout.tsx              root layout: Navbar + Footer + metadata
  page.tsx                Home
  global/page.tsx         Global — country directory (TASK 03)
  global/[code]/page.tsx  Country detail — one static page per country (SSG)
  globals.css             design tokens and type scale
  opengraph-image.tsx     generated social share image
  icon.svg                favicon
  supply-chain/page.tsx     Supply Chain — concept knowledge base (TASK 04)
  companies/page.tsx        Companies — company directory (TASK 05)
  tools/page.tsx            Tools — four inventory calculators (TASK 06)
components/
  ui/         primitives: Button, Card, Badge, Input, Section, SectionHeader,
              Field (label + value row), DemoBadge, LanguageSwitcher, StateBlock
  cards/      DataCard, NetworkCard, InsightCard, CompanyCard, ToolCard,
              CountryCard, ConceptCard
  layout/     Navbar, Footer
  providers/  LanguageProvider
  home/       Hero
  global/     CountryDirectory (country list + region filter)
  supplyChain/ SupplyChainView, ScorFramework, ConceptLibrary
  companies/  CompaniesView, CompanyDirectory, CompanyFilters
  tools/      ToolDirectory (switcher), Calculator (shared shell)
lib/
  i18n/       en.ts (source of truth), zh.ts, index.ts, languageStore.ts
  data/       types.ts, enums.ts, provenance.ts, index.ts — typed data access
  formulas.ts     shared formula definitions (single source)
  calculators.ts  typed input parsing + pure calculation functions
  seo.ts      metadata helper
data/
  snapshot.json networks.json concepts.json companies.json calculators.json
  countries.json supply-chain-topics.json scor-processes.json
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
npm run validate:data # JSON structure, references, enums and bilingual fields
```

Requires Node.js 22.18+ (22.22.2 is the verified local version). The data validator imports erasable TypeScript directly.

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

**Numbering standard** (set by TASK 07.00, 2026-10): a task number maps to the
first two segments of the version it belongs to — TASK 07 → v0.7.x, TASK 08 →
v0.8.x, TASK 10 → v1.0.x, and so on. Sub-tasks use `TASK 07.01`, `07.02`, …
(two-digit sequence). The mapping is forward planning only — it does not mean
those versions are finished or released. Old letter-suffixed sub-numbers
(06.8, 06.12B, 06.12C …) are historical and kept for traceability; new work
uses the standard form only.

Note on wording: the product phases in the long-term vision below —
**V1 Structure / V2 Real data / V3 Intelligence** — are stages, not version
numbers. The version `v1.0.0` itself will be reached at TASK 10 (Database &
Data Pipeline), by which point the five-page MVP will long since have shipped.

| Task | Goal                                                | Version  | Status      |
| ---- | --------------------------------------------------- | -------- | ----------- |
| 01   | Project skeleton, Git, deploy pipeline              | v0.1.x   | Done        |
| 02   | Home page (02.5–02.12: i18n, design system, components, data layer, SEO, docs) | v0.2.x | Done |
| 03   | **Global** — country / region view                  | v0.3.x   | Done        |
| 04   | **Supply Chain** — knowledge base                   | v0.4.x   | Done        |
| 05   | **Companies** — supply chain role directory         | v0.5.x   | Done        |
| 06   | **Tools** — EOQ, safety stock, reorder point, turnover | v0.6.x | Done      |
| 06 + | v0.7.0 visual upgrades (Field density, Hero, SCOR); then country detail pages, interactive globe, layout-shift fix and the TASK 07.02 Global audit fixes (historical sub-numbers 06.8–06.12) | v0.7.0 / v0.7.1 | Done |
| 07   | **Product Experience** — page-level visual audits and improvements (07.01 Global audit, 07.02 Global improvement, 07.03 audit closure) | v0.7.x | Done |
| 08   | Data foundation & quality (shared types, validation) | v0.8.x   | Done        |
| 09   | Data acquisition — Python crawlers for real datasets | v0.9.x   | Planned     |
| 10   | Database & data pipeline — PostgreSQL + FastAPI     | v1.0.x   | Planned     |
| 11   | Analytics & visualisation (charts, maps)            | v1.1.x   | Planned     |
| 12   | Intelligence & AI (RAG over curated sources)        | v1.2.x   | Planned     |

TASK 01–06 delivered the five-page MVP (the **V1 — Structure** phase). TASK 07
closed out that work: **07.01** audited the Global page, **07.02** implemented
the six findings the audit accepted, and **07.03** closed the audit as
documentation only — no product change and no new feature phase. Each task ends
with one commit on `main`. TASK 08.01–08.05 are now complete. Independent network-anchor and Demo-label
follow-ups remain open before the next acquisition phase is designed.

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

### Data maintenance (TASK 08)

See [docs/DATA-SCHEMA.md](docs/DATA-SCHEMA.md) for fields, IDs, references,
provenance policy, validation limits and instructions for adding records.
The validator checks structure, controlled values and references; it does not
fact-check descriptions or prove source authenticity. Five coverage warnings
remain intentional. D-03 network anchors and D-04 per-item Demo labelling / the
meaning of 195+ remain independent follow-ups, not completed features.
