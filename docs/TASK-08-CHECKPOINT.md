# TASK 08.01–08.04 development checkpoint

2026-10-28. This checkpoint is not the v0.8.0 release. Version remains 0.7.1; 08.05 data documentation and final closeout are pending.

## Included

- Shared runtime enums, inferred types, Region consistency and exhaustive regionKey.
- Optional Provenance with a single curated default via provenanceOf.
- Zero-dependency validate:data command using authoritative enums, formulas and dictionary keys.
- Conditional provenance on concept cards and country details; no invented sources, dates or JSON changes.
- Fixed region ordering, retaining only populated regions; unused Tool.category removed.

## Review fixes

Malformed metrics previously could throw during formula-reference collection. Primitive/array/null records could reach object-only operations. The validator now reports malformed records and safely traverses metrics. Content IDs now receive the previously missing lowercase hyphenated slug check; calculator IDs remain governed by the formula registry and may be camelCase.

README now documents the validator's Node 22.18+ prerequisite and the in-progress TASK 08 status. Dependencies and lockfile remain unchanged.

## Evidence

validate:data: exit 0, 8 files / 60 records / 0 errors / 5 existing coverage warnings. ESLint: exit 0, no warnings. Default Turbopack build: exit 0, TypeScript and 17 generated pages. git diff --check passes.

Isolated copies outside the repository tested malformed metrics, primitive records, invalid slug and missing topicId: each exits 1 without TypeError; restored normal fixture exits 0. Production JSON was never edited. Prior 08.03/08.04 rendering and region regressions are recorded in the Codex chat deliverables; they were not all rerun during this review.

## Remaining boundaries

08.05 must document actual schemas and validation limits. D-03 anchors and D-04 per-item Demo labels / verification of 195+ remain independent follow-ups. No live data acquisition, enterprise-source UI, CI integration or new dependencies are included. The five coverage warnings are intentional, not fabricated relationships to be filled for a green count.

The provenance validator checks date format, not calendar validity, and nonempty URL strings, not source authenticity. Source UI only links HTTP(S) values. More comprehensive source validation belongs to a separately scoped data-acquisition task.
