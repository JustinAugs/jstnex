# Network entrances and snapshot labels

2026-10-29, after v0.8.0. D-03: Trade targets /global#country-directory; Logistics targets #port-directory (existing ports grouped by country); Networks targets #network-exploration (Companies / Supply Chain entrances, not a relationship graph). Anchor IDs are unique, scroll offset accommodates navigation; alignment runs after hydration/font loading.

D-04: three original sample figures retain values/units and receive per-card Demo Data. The fourth item is now Site coverage, derived from country records, not a global count. Snapshot kind is demo/coverage. Coverage prohibits stored value/unit; demos require value. No external statistics were inserted.

The old 195+ / recognised states and territories wording had no stated inclusion rule. Checked UN primary references on 2026-10-29:
- https://research.un.org/en/unmembers (193 member states)
- https://research.un.org/en/unmembers/observers (Holy See and State of Palestine as non-member observer states)
These describe specific membership/observer categories; they do not justify the old open-ended countries-and-territories label. We replace the metric's meaning rather than claim to have established a universal total.

Acceptance: validate:data 8 files/60 records/0 errors/5 existing coverage warnings; ESLint and default build pass (17 pages). Runtime fixture confirms coverage changes 8→2 when country input changes in memory. Browser EN/ZH Home at 1440/768/390 shows three demo labels, no 195+, and no horizontal overflow. Global same widths has no overflow. Three anchor IDs each occur once; direct/hash navigation needs layout to settle, then target aligns with navigation offset. Existing country data, company data, concepts, formulas and dependencies unchanged.

Limits: not an external port verification or map, no flow/ranking claims, no full screen-reader/Safari suite. v0.8.0 remains unchanged; v0.8.1 groups these product follow-ups.
