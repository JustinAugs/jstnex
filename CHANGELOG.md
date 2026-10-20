# Changelog

All notable changes to JSTNEX, oldest first.

These are **development milestones**, not published releases — the package is
private, so the version numbers track progress rather than npm tags.
Each entry corresponds to one task and one commit on `main`.

Format: `Added` / `Changed` / `Fixed`, in plain language, no jargon without
explanation.

---

## 0.7.0 — Visual upgrade: Field density, Hero illustration, SCOR structure

One release grouping three visual improvements (TASK 06.8, 06.9, 06.10).
Data, copy, formulas, calculator logic and filters are unchanged throughout.

**Changed — Field layout (TASK 06.8)**

- `components/ui/Field.tsx` — the label column no longer takes a fixed
  `112px` out of every card. Inside a narrow card the value now flows under
  its label and uses the full card width (previously squeezed into ~179px,
  which made Country/Company/Concept cards grow to 579–746px tall); short
  values still sit beside their label when there is room. When the card is
  wide enough (≥448px, e.g. two-column layouts), the label returns to a
  fixed aligned column. The switch is driven by the card's real width
  (container query on the `<dl>`), not by the screen width, so it behaves
  the same in any grid.
- `components/cards/CountryCard.tsx`, `components/cards/CompanyCard.tsx`,
  `components/cards/ConceptCard.tsx` — their `<dl>` elements declare
  `@container` so `Field` can measure the card it lives in. No markup,
  data, copy or logic changes.
- Measured effect (1440px viewport, English): tallest company card
  746px → 637px, tallest concept card 645px → 536px, Companies page
  4710px → 4294px, Supply Chain page 5152px → 4862px. Country cards are
  roughly unchanged in height — their text is short, so stacking labels
  cannot win back more than it costs — but their reading width doubles
  from 179px to 307px. Chinese pages are 30–60px shorter overall.

**Changed — Home Hero visual (TASK 06.9)**

- `components/home/NetworkIllustration.tsx` — new self-drawn inline SVG,
  a global supply-network illustration (globe, graticule, nodes, arcs) for
  the Hero's right-hand side. Zero new dependencies and zero external
  requests; colours come from the existing Design System tokens.
- `components/home/Hero.tsx` — the Hero is now a two-column layout on
  desktop (`2fr : 1fr`, chosen from measured title width so the headline
  keeps its two-line break) and stacks on tablet/mobile. No fixed height.
- `lib/i18n/en.ts`, `lib/i18n/zh.ts` — one new key
  `hero.illustrationCaption` ("Global Network Illustration" / "全球供应网络示意图").
  The caption states plainly that this is an illustration, not real trade
  routes or geographic data.

**Changed — Supply Chain structure (TASK 06.10)**

- `components/supplyChain/SupplyChainView.tsx` — the page header and the
  SCOR framework now share one section (matching the existing Global and
  Companies pages), removing a large empty gap below the header.
- `components/supplyChain/ScorFramework.tsx` — the seven SCOR processes
  changed from a plain text list into a "process strip + explanation grid":
  numbered nodes joined by connector lines and arrows (one row at ≥1280px,
  fewer columns below that), plus a one-line summary per process. Process
  names, order (01–07) and bilingual copy are unchanged.

**Version**

- `package.json` / `package-lock.json` version → `0.7.0`.

---

## 0.6.1 — Display precision and small hardening

**Fixed**

- `components/tools/Calculator.tsx` — a tiny non-zero result is no longer shown
  as `0`. Values below `0.01` now use three significant digits (`0.00128`),
  values below `1e-6` use scientific notation, while ordinary numbers keep two
  decimals and integers keep no trailing zeros. The calculation itself is
  unchanged; only display formatting.
- `data/concepts.json` — the four calculator-backed metrics (EOQ, safety stock,
  reorder point, inventory turnover) no longer store a duplicate `unit`. Their
  units come from `resultUnit` in `lib/formulas.ts`, so each unit exists in one
  place. Displayed units are unchanged (`units` / `times / year`).

**Changed**

- `components/tools/Calculator.tsx` — the formula `switch` now ends with an
  exhaustiveness guard (`assertNever`). Adding a new `FormulaId` without a
  matching branch becomes a compile error instead of a silent no-op.
- `package.json` / `package-lock.json` version → `0.6.1`.

---

## 0.6.0 — Tools page (inventory calculators)

**Added**

- `/tools` — four working calculators: **EOQ**, **Safety Stock**, **Reorder
  Point** and **Inventory Turnover**. In-page switching (no detail pages), with
  the selected calculator clearly marked and state reset on every switch.
- `lib/formulas.ts` — the **single source** for the four formulas: expression,
  symbols, units, input metadata (type / decimal allowance / default / hint) and
  assumptions. The concept library and the calculators both reference it, so a
  formula is never maintained twice.
- `lib/calculators.ts` — typed input interfaces and two deliberately separate
  layers: `parseXxx()` (string → number, empty is never coerced to 0) and
  `calculateXxx()` (number → three-state result: `ok` / `invalid` /
  `undefined`). No NaN or Infinity ever reaches the UI.
- `data/calculators.json` — thin metadata (id, formulaId, title, summary,
  order); no formula strings.
- `components/tools/Calculator.tsx` — shared calculator shell: formula,
  assumption note, field-level errors, exact value, optional integer reference,
  result panel.
- `components/tools/ToolDirectory.tsx` — switcher + current calculator.
- Safety Stock — four reference service-level chips (90% = 1.28, 95% = 1.645,
  98% = 2.054, 99% = 2.326). Z can always be typed manually; the note explains
  these are common normal-distribution approximations, not a universal rule.
- New **EOQ** concept in `data/concepts.json`, linked to the same formula.
- `dict.tools` extended with calculator UI, field errors and domain-reason
  messages in EN and ZH.

**Changed**

- `data/concepts.json` — safety stock, reorder point and inventory turnover
  metrics now store `formulaId` instead of a hand-written formula string.
  `lib/data/index.ts` fills `formula` from `lib/formulas.ts` at load time, so
  `ConceptCard` and `ConceptLibrary` keep the same interface.
- `lib/data/index.ts` — added `CALCULATORS`; `TOOLS` is now a derived view for
  the Home `ToolCard` (keeps the existing shape, so `app/page.tsx` is
  unchanged). An invalid `formulaId` throws instead of failing silently.
- `app/tools/page.tsx` — placeholder replaced by the real page; still a thin
  server component that only exports metadata.
- Inventory Turnover is explicitly **annual basis**: inputs are annual COGS and
  average annual inventory; the UI states that V1 does not convert periods.
- `package.json` version → `0.6.0`.

**Removed**

- `data/tools.json` — replaced by `data/calculators.json`. The old file had no
  stable ids, four self-referencing `href`s and an inconsistent safety-stock
  formula.

**Testing**

- `npm run lint` — 0 errors.
- `npm run build` — passes; all routes prerendered (`/`, `/global`,
  `/supply-chain`, `/companies`, `/tools`).
- Browser (real Chromium): EOQ 1000/50/2 → 223.61 exact / 224 integer;
  Safety Stock 1.645/10/4 → 32.9 / 33; Reorder Point 100 + 30 → 130 / 130;
  Inventory Turnover 500000 / 100000 → 5.00 with no integer reference.
- Validation: empty → "Enter a value."; `abc` / `Infinity` → "Enter a valid
  number."; H = 0 → "Holding cost must be greater than zero."; average
  inventory = 0 → "Average inventory must be greater than zero."; Z = -1 →
  "The service level factor (Z) must be zero or greater."
- Switching calculators resets inputs and results; Reset clears the current
  calculator; EN/ZH switching is complete (formula, symbols and units stay
  unchanged by design).
- 390 × 844: no horizontal overflow; no console errors.
- Regression check: Home (4 tool cards, shared formulas), Global (8 countries),
  Supply Chain (14 concepts, inventory count 5, all four formulas), Companies
  (13 companies, search present) all render normally.

---

## 0.5.0 — Companies page (supply chain role directory)

**Added**

- `data/companies.json` — 13 companies (Apple, Microsoft, TSMC, ASML, Toyota,
  Volkswagen, DHL, Maersk, Foxconn, Walmart, Amazon, Shell, Pfizer), each with
  bilingual name / country / summary / key activities / supply chain strength /
  supply chain risk. **Qualitative only: the file contains no digits at all** —
  no revenue, market share, ranking or performance figures.
- Controlled vocabularies in `lib/data/types.ts`: `IndustryId` (8 industries),
  `SupplyChainRoleId` (7 roles — deliberately no "industry leader" style
  subjective labels), `CompanyRegion` (reuses the Global page's regions).
- `components/companies/CompanyFilters.tsx` — search box + three button groups
  (industry / region / role), each with a data-derived count.
- `components/companies/CompanyDirectory.tsx` — the whole Companies page body:
  page header, search, filters, result count, card grid, data-honesty footnote.
- `components/cards/CompanyCard.tsx` — rewritten for the new data model. Not
  clickable by default (no `/companies/[slug]` exists); keeps an optional `href`
  only so the Home section can still link to `/companies` as before.
- Company search: matches EN + ZH company names, countries, and the display
  labels of industry / role (plus their stable ids), case-insensitive.

**Changed**

- `lib/data/index.ts` — `COMPANIES` now typed against the new model; added
  `INDUSTRIES` / `COMPANY_ROLES` / `COMPANY_REGIONS` (controlled order, only
  categories that actually occur) and count helpers.
- `lib/i18n/*` — extended the `companies` section; **promoted `regions` out of
  `global` to a shared top-level section** so Global and Companies use one
  region vocabulary instead of two.
- `components/ui/StateBlock.tsx` — `EmptyState` accepts optional `title` /
  `description` overrides so Companies can say "No companies found." instead of
  the generic message. Existing pages are unaffected.
- Home page — the Companies section now reads the same shared data (first 6
  entries, chosen to cover different industries / roles / regions).
- `components/global/CountryDirectory.tsx` — reads `dict.regions` instead of
  `dict.global.regions` (the only code change caused by the promotion).

**Removed**

- The old 5-company logistics-only dataset (UPS / FedEx / Kuehne+Nagel dropped;
  DHL and Maersk kept under the new model).

**Testing**

- `npm run lint` — 0 errors; `npm run build` — passes, all routes prerendered.
- Verified in a real browser (desktop 1440 / tablet 768 / mobile 390): no
  horizontal overflow, no console errors.
- Filters: industry / region / role each sum to 13; combined
  manufacturer+Asia → 3; supplier+automotive → 0 (empty state shown).
- Search: "apple" → 1, "半导体" → 2, "苹果" → 1; language toggle renders the
  full page in Chinese, including "Taiwan, China / 中国台湾".
- No dead links: zero `/companies/…` or `/global/…` links on the page.

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
