# Stage 02 functional regression progress

2026-10-29

Browser checks: keyboard Enter switches EOQ to Safety Stock; new model fields empty; switching back clears EOQ input. Chinese Enter submission returns223.61 and integer224; keyboard Reset clears all three inputs. Language persistence after refresh remains pending: immediate DOM sample read en during hydration, which does not prove final persisted state. Navigation filter/scroll restoration and full cross-browser coverage remain pending, not passed by assumption.

Defect fixed: languageStore previously allowed localStorage getItem/setItem exceptions to escape. Storage-blocked browsers could fail initial language read or stop listener notification during switching. Both operations now catch storage failures and preserve in-memory operation. Isolated execution of the actual transpiled store verified available/blocked read, switch and notification cases. No change to default language or storage key.

Checks: lint and data validation passed (five existing coverage warnings retained); diff check clean. Default Turbopack production build was blocked by environment port binding permission, including retry. Webpack fallback production build passed; do not call this a successful default build.

Remaining: persisted language after hydration, filter/scroll restoration semantics, numeric extreme precision beyond initial overflow checks, full bilingual keyboard traversal. Deployment environment remains unverified; no push or deployment.
