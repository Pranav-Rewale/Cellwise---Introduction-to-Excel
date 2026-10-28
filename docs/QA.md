# Quality assurance record

Verified on **28 October 2026**. The module is a deployable static MVP. The results below describe the checks actually performed, not a formal accessibility certification.

## Automated checks

`python scripts/check.py` passes for **7 HTML files**: overview, five lessons, and template.

- Local page links, fragments, CSS, JavaScript, images, favicon, and CSV resolve.
- No duplicate IDs or retained authoring placeholders in learner pages.
- Each page has a language, document title, one main landmark, and one h1.
- Main-content heading levels do not skip levels.
- Every informative image has descriptive alt text and explicit dimensions.
- Every radio input has an explicit label; tables have captions and scoped headers.
- All seven SVG files parse as valid XML.
- The four practice records calculate to **₹207.00**.
- Six primary text/background palette pairs meet **4.5:1** or better.

JavaScript syntax passes with `node --check` for `assets/js/app.js`, `scripts/serve.mjs`, and `scripts/browser-check.cjs`.

### Browser checks

Tested using **Playwright 1.62.1**, with **Microsoft Edge / Chromium 156.0.4314.50**, headless on Windows. See [machine-readable results](browser-results.json) and the reproducible `scripts/browser-check.cjs` script.

| Check | Result |
| --- | --- |
| All 7 pages at widths 320, 390, 768, 820, 1024, 1440px | Pass: no document-level horizontal overflow; every illustration loads; hero title does not overlap the image |
| Mobile menu open/close | Pass: expanded state reflects visibility |
| Escape inside mobile navigation | Pass: menu closes and focus returns to toggle |
| Keyboard skip link | Pass: first Tab reaches skip link; Enter focuses main content |
| Lesson completion | Pass: progress updates, persists after reload, and changes the overview resume link |
| Unanswered quiz submission | Pass: error shown and focused; unanswered inputs marked invalid |
| Quiz score 0/5 | Pass: fail message and 5 explanations; no completion awarded |
| Quiz score 4/5 | Pass: completion awarded and score saved |
| Quiz score 5/5 | Pass: success message and 5 explanations |
| Quiz retake | Pass: selections and feedback clear; focus returns to first input |
| Quiz score after reload | Pass: latest score remains available |
| Reset progress | Pass: completions and saved score clear |
| Malformed localStorage data | Pass: page recovers with empty progress |
| Blocked localStorage access | Pass: page-local progress works; storage limitation is explained |
| JavaScript disabled at 390px | Pass: navigation, lesson text, questions, practice reveals, and manual answer key remain usable |
| Runtime errors / missing assets | Pass: none in the primary test context |

The browser script uses isolated test contexts; it does not clear a learner’s regular browser data.

### Primary color contrasts

WCAG relative-luminance calculation, rounded to two decimal places:

| Text / surface | Ratio |
| --- | --- |
| Body #344c43 / paper #fafbf7 | 8.94:1 |
| Muted #59695f / paper #fafbf7 | 5.60:1 |
| Muted #59695f / cream #f1f1e7 | 5.12:1 |
| White / button green #176b49 | 6.49:1 |
| Accent #a94c24 / cream #f1f1e7 | 4.93:1 |
| Green #176b49 / lime #e7efc9 | 5.44:1 |

This is a check of the named primary palette pairs. It is not a complete automated accessibility audit of every rendered element.

## Editorial and visual review

- Read the lesson copy for spelling, grammar, consistent terminology, and heading clarity. Verified that workbook/worksheet, cell/range, sort/filter, and value/format are distinguished.
- Checked the calculation examples by hand: 24 × 4.50 = 108; 30 × 1.50 = 45; 30 × 0.80 = 24; 6 × 5 = 30; total ₹207.00. Increasing notebook quantity to 26 produces 117 and a total of 216.
- Checked that prompts, worked examples, quiz explanations, and the manual answer key agree. Lesson 3 explicitly starts with unsorted data. Lesson 4 clears filters before charting. Lesson 5 specifies Paste Values for its chart summary to preserve calculated results.
- Compared image descriptions with the original SVG diagrams. Each image’s important values or concept is also represented in HTML text or a table. The overview image is an illustration, not an interactive spreadsheet.
- Reviewed screenshots for desktop, mobile, a full lesson, and quiz feedback. Confirmed visible spacing, readable content hierarchy, and consistent component styling. Tablet visual review identified a crowded hero, corrected by stacking it below 1050px; the final layout is also checked for title/image overlap.
- The four Microsoft resource URLs were opened through a web reader and resolved to the expected official help pages. Network checks are time-sensitive; the local checker deliberately does not claim to validate external URLs.

## Screenshots

- [Desktop overview — 1440px](screenshots/desktop.png)
- [Tablet overview — 820px](screenshots/tablet.png)
- [Mobile overview — 390px](screenshots/mobile.png)
- [Desktop lesson](screenshots/lesson-desktop.png)
- [Quiz with feedback](screenshots/quiz.png)

## Before your own public release

- [ ] Repeat static and browser checks after editing content, filenames, navigation, or scoring.
- [ ] Test keyboard-only radio selection with arrow keys, tables with horizontal scrolling, all links/buttons, and focus visibility in your target browsers.
- [ ] Test with NVDA/Edge and VoiceOver/Safari for landmarks, headings, expanded state, progress, radio groups, and result announcements. **Screen readers were not run for this delivery.**
- [ ] Check Firefox, Safari, and real iOS/Android devices. **The automated browser run covered Chromium only.**
- [ ] Check 200% and 400% browser zoom, forced colors/high-contrast modes, and reduced-motion preferences. Responsive viewport reflow was tested; **these separate platform settings were not exercised.**
- [ ] Open all external resources and proofread again after customization; automated structure checks do not validate meaning or grammar.
- [ ] Confirm the target host serves all real HTML page paths, MIME types, HTTPS, and security headers correctly.

No backend, identity, cross-device sync, LMS/SCORM integration, or secure exam validation is included. The knowledge check is practice, and its answers are intentionally inspectable in the source.

## INR localization

The teaching examples, tables, chart titles, image descriptions, original SVG diagrams, practice CSV heading, quiz wording, and README use Indian rupees (INR). The illustrative budget totals ₹207.00. Currency symbols were changed independently of Excel’s fixed-reference syntax, so `$B$2` remains valid. Responsive screenshots were refreshed from the INR version.
