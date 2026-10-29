# Stage 01 correctness fixes and Stage 02 initial regression

2026-10-29

Changes: production site origin validation; calculated-value wording and rounding disclosure in both languages; mobile navigation Escape close/focus return, aria-controls and aria-current; lib-scoped ESM declaration (root configuration unchanged); production configuration instructions.

Validation: ESLint clean; validate:data 60 records, zero errors, five pre-existing coverage warnings; configured production build generated 17/17 pages; diff check clean. Seven origin configuration cases passed, including missing production configuration, loopback, path and credentials rejection. Built Global HTML uses the configured origin and contains no localhost URL. Browser verified Escape closes menu and returns focus; EOQ remains 223.61 with integer reference224.

Initial Stage 02 regression: 21 calculator assertions passed (four empty parsers, Infinity rejection, EOQ reference and positive constraints, safety-stock zero/negative/standard cases, reorder point, turnover zero/denominator cases and overflow). Browser combined semiconductor/Europe/supplier filters returned ASML; adding TSMC search returned a helpful empty state. This is initial coverage, not completion of every boundary, language, browser or navigation restoration case.

Deployment: public Vercel endpoint timed out; production environment variables and Production deployment identity remain unverified. No push/deployment performed. Before pushing, verify NEXT_PUBLIC_SITE_URL in Vercel and its target environments; the new build intentionally fails when production configuration is absent. No claim that local success proves online correctness.

Next: finish remaining Stage 02 numeric extremes, reset/model-switch and bilingual keyboard/navigation regression; fix proven defects; then implement Companies information hierarchy as the first visual sample.
