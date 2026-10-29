# Stage 02 functional regression progress

2026-10-29

Browser checks: keyboard Enter switches EOQ to Safety Stock; new model fields empty; switching back clears EOQ input. Chinese Enter submission returns223.61 and integer224; keyboard Reset clears all three inputs. Language persistence after refresh remains pending: immediate DOM sample read en during hydration, which does not prove final persisted state. Navigation filter/scroll restoration and full cross-browser coverage remain pending, not passed by assumption.

Defect fixed: languageStore previously allowed localStorage getItem/setItem exceptions to escape. Storage-blocked browsers could fail initial language read or stop listener notification during switching. Both operations now catch storage failures and preserve in-memory operation. Isolated execution of the actual transpiled store verified available/blocked read, switch and notification cases. No change to default language or storage key.

Checks: lint and data validation passed (five existing coverage warnings retained); diff check clean. Default Turbopack production build was blocked by environment port binding permission, including retry. Webpack fallback production build passed; do not call this a successful default build.

Remaining: persisted language after hydration, filter/scroll restoration semantics, numeric extreme precision beyond initial overflow checks, full bilingual keyboard traversal. Deployment environment remains unverified; no push or deployment.

## Follow-up: language, back navigation and numeric extremes

- Browser waited for the Chinese heading after reload; final html lang was zh-CN. Language persistence is now verified for this browser sample.
- Europe -> Germany detail -> browser Back retained Europe selection.
- Pixel-exact scroll restoration is not certified: a sample read779px before activation and392px after Back. Activation may scroll the focused link into view, so these are not a controlled pre-navigation pair. Do not label this a proven restoration bug or a passed pixel comparison. Retest as part of the directory layout work.
- Reproduced EOQ intermediate overflow/underflow: D=S=H=1e200 yielded Infinity despite a representable root; D=S=H=1e-200 yielded zero. Fixed by log-space fallback only when direct arithmetic returns zero/nonfinite and inputs are finite. Normal arithmetic, validity rules and integer reference policy remain unchanged.
- Added `node scripts/check-calculator-extremes.mjs`: tests real transpiled implementation, representable tiny/large roots, normal integer reference, true overflow in EOQ/turnover/reorder point, and safety-stock zero. Passed.
- ESLint, validate:data (five existing coverage warnings), Webpack production build and diff check passed after this fix. Default Turbopack environment issue from earlier remains distinct. No production verification or deployment performed.

Next: information hierarchy sample for Companies; include controlled scroll/focus restoration testing with the new layout. Cross-browser and exhaustive keyboard/accessibility checks remain outside the verified sample set.

## 02.06 Controlled return position and focus — completed sample

2026-10-29. Desktop in-app browser, English Global directory.

Before fix: after focusing Germany card and activating with Enter, browser Back retained Europe but focus fell to BODY. Earlier uncontrolled pixel samples are superseded by the following controlled check.

Fix: record the activated country-card href and scrollY for unmodified primary activation (including keyboard-generated click). On directory remount, after fonts/layout frames settle, restore the matching card focus with preventScroll and restore the captured scroll position instantly. Explicit hash navigation retains priority. Modified clicks/new-tab activation do not replace return state. Existing module-scoped region persistence is unchanged.

After fix: Europe selected, Germany focused, y304.5 -> Enter -> detail -> browser Back -> Europe selected, Germany focused, y304.5. A separate All-directory run restored y1028 and Germany focus; the detail's explicit return-directory link also restored y1028 and Germany focus. Evidence: chat workspace outputs/02-06-restored.png. These are sampled desktop-browser checks, not exhaustive Safari/mobile/assistive technology certification.

Checks: ESLint, data validation (five existing coverage warnings), calculator extreme regression, Webpack production build, diff check passed. No push/deployment. Default Turbopack permission limitation remains environmental.

Next numbered task: 03.01 Companies information hierarchy sample. Preserve verified filters and keyboard behavior; check bilingual desktop/tablet/mobile and relevant navigation after layout changes.
