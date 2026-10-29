# JSTNEX data schema and maintenance guide

TASK 08.05 · 2026-10-29 · implementation baseline: `30dec7f`.
This documents the current JSON application, not an implemented database or API.
Types, controlled values and validation rules remain authoritative in their source files; update this guide when changing them.

## 1. Data flow and inventory

`data/*.json` → `lib/data/types.ts` / raw types → `lib/data/index.ts` → components.
Pages consume `@/lib/data`, rather than importing JSON directly. Type assertions in the loader do **not** validate JSON at runtime: run the validator after edits.
Future API migration is an architectural intention; asynchronous loading, caching and failures still require design.

Current snapshot: 8 arrays, 60 records. Counts are observations, not fixed limits.

| JSON file | Records | Identity | Main consumers |
|---|---:|---|---|
| countries.json | 8 | unique code | Global directory/details; Home globe; related-country labels |
| companies.json | 13 | unique id | Companies directory; Home featured companies |
| concepts.json | 14 | unique id | Supply Chain library; Home featured insights |
| supply-chain-topics.json | 7 | unique id | concept filters and topic names |
| scor-processes.json | 7 | unique id | SCOR framework; concept process names |
| calculators.json | 4 | unique id | Tools; derived Home tools |
| networks.json | 3 | English title used as React key | Home network entrances |
| snapshot.json | 4 | English label used as React key | Home snapshot |

Each file is a top-level array of objects. Identifiers are stable and language-independent.
Concept/company/topic/SCOR IDs use lowercase alphanumeric segments separated by single hyphens: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
Calculator IDs currently use camelCase as well: `eoq`, `safetyStock`, `reorderPoint`, `inventoryTurnover`. Do not apply content-slug rules to these IDs.

### Shared field notation

`LT` means `LocalizedText`: an object with nonempty string `en` and `zh` values. Interface labels live in `lib/i18n/en.ts` and `zh.ts`; record content lives in JSON. Use `pick(value, language)` for content.

In the tables, “required” means the key must exist. “Optional” means it may be omitted. Optional does not imply nullable. A required nullable field must remain present even when its value is `null`.
Strings described as content must be nonempty; formula symbols, units, country codes and port names are not translated. Brand names may be identical across languages but both LT keys remain required.

## 2. Country

| Field | Type | Requirement / semantics |
|---|---|---|
| code | string | required, unique uppercase two-letter code |
| name | LT | required country name |
| region | Region | required controlled value |
| role | LT | required supply-network role |
| summary | LT | required qualitative introduction |
| ports | string[] | required nonempty array of nonempty common English names |
| exports | LT | required qualitative export description |
| strength | LT | required structural strength |
| risk | LT | required vulnerability |
| provenance | Provenance or null | optional, see source policy |

Country codes follow the ISO alpha-2 convention, but validation only checks syntax and uniqueness; it does not query an ISO registry. Detail URLs use lowercase codes, e.g. `/global/cn`. Unknown codes return 404. Uppercase detail URLs are not promised to work under the static route configuration.

## 3. Company

| Field | Type | Requirement / semantics |
|---|---|---|
| id | slug string | required, unique |
| name | LT | required |
| industry | IndustryId | required controlled value |
| country | LT | required display text, **not** a countries.code foreign key |
| region | Region | required, same type as Country.region |
| role | SupplyChainRoleId | required controlled value |
| summary | LT | required |
| keyActivities | LT[] | required nonempty array |
| supplyChainStrength | LT | required qualitative strength |
| supplyChainRisk | LT | required qualitative risk |
| provenance | Provenance or null | optional |
| relatedConcepts | string[] | optional; empty allowed; null not allowed; unique references to concepts.id |

Do not introduce revenue, ranking or market-share figures without a separately scoped real-data task. Related concepts are reserved data; company/concept detail navigation is not implemented merely because a reference exists.

## 4. Concept and raw metrics

| Field | Type | Requirement / semantics |
|---|---|---|
| id | slug string | required, unique |
| title | LT | required |
| summary | LT | required; Home insight text |
| topicId | string | required existing topics.id |
| level | ConceptLevel | required controlled value |
| definition | LT | required |
| whyItMatters | LT | required |
| featured | boolean | required; selects Home insights |
| scorProcess | string or null | required key; non-null references scor-processes.id |
| metrics | raw metric[] or null | required key; empty array allowed |
| relatedCountries | string[] or null | required key; empty allowed; references countries.code |
| relatedConcepts | string[] | required; empty allowed; existing concept IDs, no duplicates or self-reference |
| provenance | Provenance or null | optional |
| source | null | deprecated raw key, optional; any non-null value rejected |
| updatedAt | null | deprecated raw key, optional; any non-null value rejected |

The three required nullable fields are not optional: deleting their keys fails validation. `topicId` never permits null. Deprecated fields are not public Concept fields; retained JSON nulls are compatibility data, not another source model.

Raw metric fields:

| Field | Type | Rule |
|---|---|---|
| name | LT | required |
| formula | string | exactly one nonempty formula or formulaId |
| formulaId | FormulaId | existing FORMULAS key; mutually exclusive with formula |
| unit | string | optional, nonempty when present |

`enrichConcept()` turns raw metrics into public `ConceptMetric { name, formula, unit? }`.
With formulaId it gets `expression` from `formulaFor()` and uses explicit unit if present, otherwise `resultUnit`. Without formulaId it retains the supplied formula and optional unit. For calculator metrics, avoid redundant unit overrides; the registry should provide the unit.

## 5. Topics, SCOR and calculators

| Dataset | Required fields | Rules |
|---|---|---|
| topics | id: slug, name: LT, order: number | unique IDs; integer order values must be exactly 1..n without duplicates |
| SCOR | id: slug, name: LT, summary: LT | unique IDs; current JSON sequence determines presentation |
| calculators | id: string, formulaId: FormulaId, title: LT, summary: LT, order: number | unique nonempty IDs; registered formula; integer order 1..n |

SCOR DS uses Orchestrate, Plan, Order, Source, Transform, Fulfill, Return; do not restore the superseded six-process draft. There is no current SCOR order field.

`lib/formulas.ts` holds expression, resultUnit and input metadata. `lib/calculators.ts` holds parsing and calculation functions. `data/calculators.json` stores metadata, not a second formula implementation. `CALCULATORS` is sorted by order. Home `TOOLS` is derived as `{name, description, formula, href}`; it has no category field. Old tools.json and insights.json are no longer data sources.

Adding a new calculator needs a separately scoped code change to the formula registry, parser/calculation dispatch, UI cases and translations. Adding metadata alone does not implement a calculator. Current id/formulaId equality is not a general invariant enforced by the validator.

## 6. Home-only records

| Dataset | Field | Requirement |
|---|---|---|
| snapshot | label: LT | required; English label unique for React key |
| snapshot | kind: "demo" or "coverage" | required; demo is illustrative, coverage is directory count |
| snapshot | value: string | required only for demo; forbidden in coverage raw JSON, derived at load time |
| snapshot | unit: string | optional, nonempty if present |
| snapshot | note: LT | required explanation of the figure |
| networks | title: LT | required; English title unique for React key |
| networks | description: LT | required |
| networks | href: string | required nonempty path beginning with `/` |

The path check does not prove a destination or anchor exists. Network entrances target `/global#country-directory`, `/global#port-directory`, and `/global#network-exploration`. The port index is derived from existing countries; exploration links to existing Companies and Supply Chain pages.
Snapshot figures used for layout are Demo Data. The old `195+` item was replaced with directory coverage. Coverage forbids raw value/unit and derives its value from countriesJson.length in the loader. It is not a global country total. Three demo items carry per-card Demo Data labels; coverage carries Site coverage.

## 7. Controlled values and region views

The runtime arrays in `lib/data/enums.ts` are the only controlled-value source. Types are inferred from them. Keep this module import-free and compatible with native erasable TypeScript imports.

| Array | Type | Current values |
|---|---|---|
| REGIONS | Region | Asia, Europe, North America |
| INDUSTRIES | IndustryId | technology, automotive, logistics, semiconductors, manufacturing, retail, energy, pharmaceuticals (membership list; see source for ordering) |
| SUPPLY_CHAIN_ROLES | SupplyChainRoleId | brand-integrator, manufacturer, supplier, logistics-provider, retailer, technology-provider, raw-material-energy |
| CONCEPT_LEVELS | ConceptLevel | fundamental, intermediate, advanced |
| PROVENANCE_KINDS | ProvenanceKind | curated, official, dataset |

The table is explanatory, not another runtime allowlist. Update the source first and check translations. Loader REGIONS / COMPANY_REGIONS / INDUSTRIES / COMPANY_ROLES are populated views, not full legal-value lists. Both region filters use the authority order Asia → Europe → North America while excluding empty regions. `regionKey()` maps legal regions to dictionary keys and throws on unknown runtime values rather than labelling them Asia.

## 8. Provenance and honest rendering

| Field | Type | Rule |
|---|---|---|
| kind | ProvenanceKind | required when a provenance object exists |
| name | string | optional; nonempty when present |
| url | string | optional; nonempty when present |
| retrievedAt | string | optional YYYY-MM-DD |
| updatedAt | string | optional YYYY-MM-DD |

Country, Company and Concept allow provenance to be omitted or null. `provenanceOf(record)` is the sole default conversion to `{kind:"curated"}` and does not write back to JSON. Current 35 content records have no populated provenance (snapshot, not a permanent rule).

- **curated**: manually assembled descriptions or teaching knowledge; not automatically Demo Data and not an official-source claim.
- **official**: reserved for genuinely identified official sources; selecting the kind is not proof of verification.
- **dataset**: reserved for an identified external dataset; likewise requires actual evidence.
- **Demo Data**: illustrative numbers/examples, not a provenance kind. Do not label an ordinary concept definition as fake statistics.

Concept cards and country details show a source row only for non-curated provenance with a nonblank name. An HTTP(S)-prefixed URL becomes an external link with noopener/noreferrer; no URL or an unsupported scheme falls back to text. The two UIs currently do not display date fields. Company source UI is not implemented.

The validator checks date **format**, not calendar validity, freshness or authenticity. It checks a URL is a nonempty string, not whether it parses, resolves or is authoritative. Source rendering is conditional display, not a fact-checking system. Do not invent sources, URLs or dates to populate these fields. Actual acquisition belongs to TASK 09.

## 9. Reference integrity and validation limits

References point to actual loaded records: concept→topic/SCOR/country/concept; company→concept; metric/calculator→FORMULAS. Concept and company relatedConcepts reject duplicate IDs; concepts also reject self-reference. The relatedCountries checker currently verifies array elements exist but does not independently enforce uniqueness. Do not assume every array has identical rules.

Unreferenced concepts and unused SCOR processes are legal. Current five warnings are two unused processes (order/return) and three concepts not referenced by a company. Do not fabricate relations to remove warnings. Warnings can legitimately change as content grows.

The validator is a quality gate, not full JSON Schema, a rejection of every extra key, an ISO database, a live-link checker or a content fact-checker. The final cross-check row covers its separately attributed lib checks; data-file errors can coexist with that row passing, while the overall exit remains failure.

## 10. Adding or editing content

1. Inspect the relevant existing record and its public/raw type. Edit the correct JSON array; keep stable identifiers and complete English/Chinese content.
2. For a country, use a verified uppercase code, existing Region, meaningful qualitative fields and port names. Check the generated lowercase detail page; globe nodes are separately configured and are not automatically added.
3. For a company, choose an existing industry/role/region, fill both language values, supply activities and qualitative strength/risk. Only reference existing concepts; country is display text, not a code reference.
4. For a concept, select an existing topic, level and optional single SCOR process. Keep required nullable keys. Use empty relatedConcepts when none, no self-reference. Reference FORMULAS for calculator metrics, otherwise provide one explanation formula. Choose featured deliberately because it affects Home.
5. For calculator metadata changes, preserve registered formulaId and unique ID/order; do not introduce a new mathematical tool without the code work described above.
6. For sources, retain curated defaults until evidence exists. Never copy a fictional example source into production. Do not insert unsourced throughput, money, rankings or dates.
7. When introducing a new controlled value, change enums.ts and corresponding dictionary keys; Region additionally needs regionKey's exhaustive mapping. Topic/SCOR references come from data, not copied enum lists.
8. Run all checks below, inspect the exact diff, then verify affected pages and both languages. Update this guide when schema changes. Versioning and deployment are separate explicit workflow steps.

Structural example only, not a complete record to paste into data:

```json
{"metrics": null, "scorProcess": null, "relatedCountries": [], "relatedConcepts": []}
```

This demonstrates that required nullable keys remain present and empty arrays differ from omitted keys. It contains no invented source or statistic.

## 11. Commands and troubleshooting

Use Node 22.18+; the verified local runtime is 22.22.2. The validator directly imports erasable `.ts` files with explicit extensions. Older runtimes are not covered by the default command.

```bash
npm run validate:data
npm run lint
npm run build
git diff --check
```

Validation returns 0 when there are no errors, including warning-only runs; errors return 1. Read file/record/field details, fix the actual cause and rerun. Missing required nullable keys are not repaired by TypeScript assertions. Do not rewrite valid data to hide a validator defect.

The known MODULE_TYPELESS_PACKAGE_JSON notice is a runtime module-detection performance warning; do not change package module type just to hide it. Local sandbox port/filesystem limits are environmental and must be distinguished from compiler or data errors. A successful local build is not evidence of production-domain availability.

## 12. Out of scope and source files

No database tables, API contracts, CI integration, external acquisition or AI pipeline are implemented by this document. D-03/D-04 anchor and labelling follow-ups are implemented after v0.8.0; no global country count is claimed.

Implementation references: `lib/data/types.ts`, `lib/data/enums.ts`, `lib/data/provenance.ts`, `lib/data/index.ts`, `lib/formulas.ts`, `lib/calculators.ts`, `scripts/validate-data.mjs`, `components/cards/ConceptCard.tsx`, `components/global/CountryDetail.tsx`, and `lib/i18n/{en,zh}.ts`.
