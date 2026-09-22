# Changelog

All notable changes to JSTNEX, oldest first.

These are **development milestones**, not published releases — the package is
private, so the version numbers track progress rather than npm tags.
Each entry corresponds to one task and one commit on `main`.

Format: `Added` / `Changed` / `Fixed`, in plain language, no jargon without
explanation.

---

## 0.4.0 — Supply Chain page (concept knowledge base)

**Added**

- `data/scor-processes.json` — the seven **SCOR Digital Standard** processes:
  Orchestrate / Plan / Order / Source / Transform / Fulfill / Return, each with a
  bilingual name and a short bilingual summary.
- `data/supply-chain-topics.json` — seven topics: inventory, transportation,
  procurement, manufacturing, planning, warehousing, risk.
- `components/supplyChain/ScorFramework.tsx` — the seven-process list.
- `components/supplyChain/ConceptLibrary.tsx` — concept grid plus topic filter,
  with counts generated from the data.
- `components/supplyChain/SupplyChainView.tsx` — thin composition layer.
- `components/cards/ConceptCard.tsx` — one card per concept.
- `components/ui/Field.tsx` — the label + value row, extracted from
  `CountryCard` so both cards share one definition.
- `supplyChain` section in `lib/i18n/{en,zh}.ts`.

**Changed**

- `data/insights.json` evolved into **`data/concepts.json`** (13 concepts). The
  four former home insights became `featured` concepts. `insights.json` was
  deleted rather than kept alongside — one knowledge source, not two.
- `lib/data/types.ts`: `Insight` replaced by `Concept`, `Topic`, `ScorProcess`,
  `ConceptLevel`, `ConceptMetric`, `ConceptSource`.
- `lib/data/index.ts`: `INSIGHTS` replaced by `CONCEPTS` / `TOPICS` /
  `SCOR_PROCESSES`, plus helpers `featuredConcepts()`, `countConceptsByTopic()`
  and `topicName()`.
- `app/supply-chain/page.tsx`: the placeholder is now a thin server component.
- `app/page.tsx`: the home Insights section reads `featuredConcepts()`, so Home
  and Supply Chain consume the same concept data.
- `components/cards/CountryCard.tsx`: its local `Field` moved to
  `components/ui/Field.tsx`.

**Two deliberate deviations from the implementation instruction**

1. **`ScorFramework` is a Client Component**, although Rule 4 asked for a Server
   Component. Language state lives on the client (`LanguageProvider` +
   localStorage), so a server component cannot know the active language — the
   seven processes would have stayed English forever, violating the bilingual
   requirement. Correctness was chosen over literal compliance.
2. **`SupplyChainView.tsx` was added.** The page intro heading also needs the
   client language state, so a thin composition layer sits between the server
   `page.tsx` and the two content blocks.

**Data honesty**

- No fabricated statistics anywhere. `source` and `updatedAt` are `null` on all
  13 concepts; the UI renders nothing rather than showing "Source: —".
- Definitions and principles carry **no** Demo badge, and the page has no
  full-page Demo Data badge: this is curated educational content, not simulated
  data. Calling it "Demo Data" would misrepresent it.
- Formulas, symbols, units and abbreviations (DIO / TEU / MTO / MTS / %) are
  never translated.

Notes for whoever comes next:

- Concept cards are deliberately **not** clickable — there is no
  `/supply-chain/[slug]` yet. The `id` field is already a URL-ready slug.
- TASK 06 (Tools) should reuse this metric data to build calculators rather than
  copying the formulas into a second place.
- `relatedCountries` renders country names as plain text on purpose: `/global`
  has no per-country destination yet, so a link would be dead.

---

## 0.3.0 — Global page (country directory)

**Added**

- `components/global/CountryDirectory.tsx` — the country list plus a region
  filter (All / Asia / Europe / North America) showing a count on each button.
- `components/cards/CountryCard.tsx` — one card per country: role in the network,
  key ports, main exports, structural strength, main vulnerability.
- `global` section in `lib/i18n/{en,zh}.ts` — page copy, region names
  (Asia / Europe / North America) and card field labels.

**Changed**

- `data/countries.json`: every country grows from 3 fields to 9. `name` is now
  bilingual (`中国` / `China`); new fields are `role`, `summary`, `ports`,
  `exports`, `strength` and `risk`.
- `lib/data/types.ts` and `lib/data/index.ts`: `Country` type updated; new
  `regionKey()` helper maps a region value like `"North America"` to its
  dictionary key; `REGIONS` provides a de-duplicated list that drives the
  filter buttons.
- `app/global/page.tsx`: the 29-line placeholder is replaced by a thin server
  component that exports metadata and renders `CountryDirectory`.
- `README.md`: status, features, project structure and roadmap updated — it no
  longer lists `/global` as unbuilt.

Why the page was split in two: a file marked `"use client"` is not allowed to
`export const metadata`. So the page stays a server component (SEO) and the
interactive part lives in its own client component. This is the standard Next.js
pattern, and it will repeat on every page that needs interaction.

Notes for whoever comes next:

- There are **no country detail pages** yet, so the cards are deliberately not
  clickable. A link that goes nowhere is worse than no link. Adding
  `/global/[code]` later means swapping the card shell to `CardLink`.
- The content is **qualitative only**. Port names stay in English because they
  are proper nouns. No throughput statistics were invented — a fabricated number
  is worse than an absent one.

---

## 0.2.12 — Documentation

**Changed**

- Rewrote `README.md`: what JSTNEX is, why it exists, tech stack with
  "In use" vs "Planned" clearly marked, current features, project structure,
  brand / data / security rules, roadmap (TASK 03 → 11) and long-term vision.

**Added**

- This `CHANGELOG.md`.

No code changes. Behaviour is identical to 0.2.11.

---

## 0.2.11 — SEO foundation

**Added**

- `lib/seo.ts` — one `buildMetadata()` helper so every future page gets
  title, description, `robots` and Open Graph data the same way.
- `app/opengraph-image.tsx` — social share image (1200×630) generated by
  `next/og`. No new dependency: it ships with Next.js.
- `viewport` export in `app/layout.tsx` (theme colour `#0A0A0A`).

**Fixed**

- Replaced the last hardcoded `tracking-[0.3em]` with the shared
  `tracking-label` utility, so letter-spacing has exactly one definition.

---

## 0.2.10 — Unified states

**Added**

- `components/ui/StateBlock.tsx` exporting `LoadingState`, `EmptyState` and
  `ErrorState`, with correct ARIA roles.

**Changed**

- Placeholder pages (`/global`, `/supply-chain`, `/companies`, `/tools`) now use
  one consistent empty treatment instead of four improvised ones.

Why: every page that will later fetch data needs the same three answers to
"there is nothing to show yet / it is loading / it broke". Deciding this now
means those pages are not redesigned later.

---

## 0.2.9 — Environment and security foundation

**Added**

- `.env.example` listing every variable the project will eventually need
  (site URL, database URL, AI key), all with empty values.
- `.gitignore` tightened, with an explicit exception so `.env.example` itself
  stays tracked.

**Changed**

- Documented the security rules: secrets live only in `.env.local`;
  `NEXT_PUBLIC_` is treated as public by definition.

Why: one careless commit in a public repository is permanent. The rules are
written down before there is any real key to lose.

---

## 0.2.8 — JSON data layer

**Added**

- `data/*.json`: `snapshot`, `networks`, `insights`, `companies`, `tools`,
  plus `countries.json` (8 seed countries for TASK 03).
- `lib/data/types.ts` and `lib/data/index.ts` — typed loading layer.

**Changed**

- Content moved out of TSX and into data files. Pages import typed constants
  from `@/lib/data` instead of embedding arrays.

Why: content and presentation should not live in the same file. Later this layer
is swapped from `import json` to `await fetch(...)` and no page needs to change.

---

## 0.2.7 — Component system

**Changed**

- Components reorganised by responsibility: `ui/` (primitives), `cards/`
  (business cards), `layout/` (navbar, footer), `providers/` (language),
  `home/` (page sections).
- `SectionHeader` gained an optional `action` slot, so badges and links sit in
  the header without each page re-implementing a flex row.

---

## 0.2.6 — Design system

**Changed**

- `app/globals.css` is now the single source of truth for colour, spacing and
  typography: tokens (`ink`, `mist`, `line`, `surface`, `deep`…), a `clamp()`
  type scale, and utilities `container-page`, `section-spacing`,
  `tracking-label`.

**Added**

- UI primitives in `components/ui/`: `Button` / `ButtonLink`, `Card` /
  `CardLink` / `CardAction`, `Badge`, `Input`, `Section`, `SectionHeader`.

Why: without tokens, every component invents its own grey and the page drifts.
One definition, referenced everywhere, keeps the visual identity stable as the
site grows.

---

## 0.2.5 — Bilingual system (EN / ZH)

**Added**

- `lib/i18n/en.ts` (source of truth), `zh.ts` (type-checked against it),
  `index.ts` (`pick()` helper), `languageStore.ts`.
- `components/providers/LanguageProvider.tsx` and
  `components/ui/LanguageSwitcher.tsx`.

Notes for future work:

- Interface text → dictionary (`dict.xxx`). Content data → `data/*.ts` / `.json`
  with `{ en, zh }` fields, read via `pick(field, language)`.
- `zh.ts` is typed as `Dictionary`, so a missing Chinese string is a **build
  error**, not a blank space in production.
- Default language is English; preference is stored under `jstnex-language`.
- Reading language uses `useSyncExternalStore` rather than setting state inside
  `useEffect`, which React 19's lint rules reject.

---

## 0.2.0 — Home page

**Added**

- Complete home page: hero, global snapshot, global network entry points,
  insights, featured companies, tools.
- `components/layout/Navbar.tsx` and `Footer.tsx`.

All figures are sample values and carry a **Demo Data** label.

---

## 0.1.0 — Initialisation

**Added**

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 project.
- Route skeleton for Home, Global, Supply Chain, Companies, Tools.
- Git repository and GitHub remote.

**Fixed**

- Next.js telemetry writes to `~/Library/Preferences`, which is blocked in this
  machine's sandbox. `NEXT_TELEMETRY_DISABLED=1` is now built into the
  `dev` / `build` / `start` scripts in `package.json`.
