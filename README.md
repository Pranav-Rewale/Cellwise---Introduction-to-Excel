# Cellwise — Introduction to Excel

A complete, responsive learning module built with semantic HTML, one shared stylesheet, and plain JavaScript. Five linked lessons take a beginner from a blank sheet to a workshop budget and chart. A five-question quiz provides a score and explanations.

## Run locally

**Fastest:** open `index.html` directly in a modern browser. All lessons, diagrams, downloads, and quiz scoring work without a build or internet connection. File-URL storage behavior varies by browser; use a local server for reliable progress persistence.

**Recommended preview, with Node.js 18 or newer:**

```sh
cd cellwise
npm start
```

Open **http://127.0.0.1:4173**. No `npm install` is needed. Stop the server with Ctrl+C. Set the `PORT` environment variable to choose another port. The server binds only to your own computer and is intended for local previews.

**Alternative, with Python 3:**

```sh
cd cellwise
python -m http.server 4173 --bind 127.0.0.1
```

## Project structure

```text
cellwise/
├── index.html                 Course overview and resources
├── lesson1.html               Cells, rows, columns, workbooks
├── lesson2.html               Data entry and number formats
├── lesson3.html               Relative references and SUM
├── lesson4.html               Sorting and filtering
├── lesson5.html               Charts and the scored quiz
├── template.html              Complete, reusable lesson shell
├── assets/
│   ├── css/styles.css         All layout, components, and responsive rules
│   ├── js/app.js              Menu, progress, resume link, quiz
│   ├── images/                Six original SVG diagrams plus favicon
│   └── data/workshop-budget.csv
├── scripts/
│   ├── serve.mjs              Dependency-free preview server
│   ├── check.py               Dependency-free static quality checks
│   └── browser-check.cjs      Optional Playwright integration checks
├── docs/
│   ├── QA.md                  Verification results and manual checklist
│   └── screenshots/           Desktop, tablet, mobile, lesson, and quiz
├── package.json
├── .gitignore
├── _headers                   Headers for compatible static hosts
└── LICENSE                    MIT
```

The CSV intentionally contains raw values, not formulas. Its Unit cost (INR) column contains illustrative prices in Indian rupees. The learner adds line totals in Lesson 3. Its four supplies total **₹207.00**. Example amounts use Indian rupees (INR); regional Excel settings may change decimal separators and currency displays.

## Learning experience

1. **Meet your spreadsheet** — 6 minutes; find cells and ranges.
2. **Enter & format data** — 8 minutes; build consistent records.
3. **Calculate with formulas** — 9 minutes; multiply and use SUM.
4. **Sort & filter** — 8 minutes; work with complete records.
5. **Visualize & check your skills** — 12 minutes; choose a chart and take the quiz.

Lessons 1–4 have an explicit completion button. Lesson 5 is completed by a quiz score of at least 4/5. Navigation remains open to every lesson. An incomplete quiz focuses an error message; a complete submission focuses the result and reveals an explanation for every question. Retry clears the current choices and feedback, retaining the latest saved score. Passing once keeps Lesson 5 complete until the learner resets course progress.

Completion IDs and the latest score live under `cellwise.excel.v1` in `localStorage`. No answers, account information, analytics, or personal details are collected. Progress belongs to this browser and origin, does not sync between devices, and is not a secure assessment record. Invalid or unavailable storage fails gracefully. Reset progress asks before clearing the course’s local state.

Without JavaScript, every lesson and navigation link still works. Practice solutions use native `<details>`. The quiz questions and manual answer key remain available; scoring and progress are JavaScript enhancements.

## Why this design

- **One practical thread:** a small workshop budget connects concepts to a usable final artifact. Objectives, worked examples, tables, and short tasks give learners a predictable rhythm.
- **Calm visual hierarchy:** forest green, warm neutral surfaces, generous spacing, and serif headings distinguish the learning content from navigation. System fonts keep loading fast and avoid external font requests.
- **Small technical footprint:** static HTML works on ordinary hosting and through a file URL. There is no framework, package installation, bundling, CDN, tracking, or runtime API dependency.
- **Reusable components:** one stylesheet defines the sidebar, hero, lesson header, callouts, tables, practice panels, buttons, and quiz. HTML navigation is intentionally repeated so each page is complete before JavaScript runs.

## Responsive layouts

| Width | Behavior | Screenshot |
| --- | --- | --- |
| Desktop, 1440px | Persistent course rail; split hero; lesson list beside outcomes; lesson content beside an in-page navigation rail. | [Desktop](docs/screenshots/desktop.png) |
| Tablet, 820px | Narrower course rail; stacked hero and outcomes; in-page links move above lesson text. | [Tablet](docs/screenshots/tablet.png) |
| Mobile, 390px | Collapsible course menu with Escape support; one-column content; stacked resources; wide touch targets. | [Mobile](docs/screenshots/mobile.png) |
| Small mobile, 320px | Fluid text and cards; tables scroll within their own labeled region if needed. | Covered by browser checks |

Additional views: [Lesson](docs/screenshots/lesson-desktop.png) · [Quiz feedback](docs/screenshots/quiz.png).

The menu breakpoint is 620px. Layout also adapts at 800px, 1050px, and 1150px. The screenshot widths are examples, not the only supported widths. Print styles remove navigation and action controls. Motion is limited to subtle hover effects and is disabled when reduced motion is requested.

## Accessibility

Designed with WCAG 2.2 AA practices in mind; this is not a conformance certification.

- A document language, descriptive title, one main landmark, one h1, logical heading levels, and semantic sections on each page.
- A visible-on-focus skip link, native links/buttons/radios, focus outlines, breadcrumb navigation, and `aria-current="page"` for the current course link.
- A mobile menu toggle with `aria-controls` and `aria-expanded`. Escape closes it and returns focus to the toggle. There is no unnecessary focus trap.
- Explicit radio labels, grouped fieldsets and legends, focused quiz error/result summaries, and per-question explanations. Feedback communicates meaning with text as well as color.
- A labeled native progress element. Course completion updates a polite status region on lesson pages.
- Descriptive `alt` on every informative image. Detailed data is also present in HTML tables or adjacent prose. Decorative icons are hidden from assistive technology.
- Table captions and column/row scopes; overflow regions can be focused and scrolled with the keyboard.
- Touch controls generally provide at least 44px height; inline text links follow normal reading flow. There are no hover-only actions or timed tasks.
- Body and control text use contrast-checked colors. Text scales with browser zoom and layouts reflow without full-page horizontal scrolling in the tested widths.

See [QA notes](docs/QA.md) for evidence, limitations, and the release checklist. Test with your target screen readers and browsers before making a formal accessibility claim.

## Reuse the template

1. Copy `template.html` and give it a filename such as `lesson6.html`.
2. Update the document title, description, breadcrumb, lesson title/number, time, and learning objective.
3. Replace the example sections, table, illustration, **alt text**, practice prompt, solution, and resource link. Keep one h1 and do not skip heading levels.
4. Add the new lesson link to the course navigation in **every HTML file** and update the previous/next links. Set `aria-current="page"` on only the matching lesson navigation link.
5. If you extend beyond five lessons, update the lesson IDs and maximum score logic in `app.js`, the progress element maximum, course facts, quiz answer key, and static checker’s expected filenames. Add a `data-complete="6"` button only after adding ID 6 to the valid IDs. The supplied template has no completion button so it cannot accidentally complete an existing lesson.
6. Run checks and repeat the manual release checklist. For a larger course, use a static-site generator to produce shared navigation during authoring while preserving the generated HTML output.

## Quality checks

With Python 3.9 or newer:

```sh
python scripts/check.py
```

This checks all seven HTML pages for broken local links/fragments, missing images and assets, duplicate IDs, input labels, heading order, table semantics, document metadata, descriptive alt attributes, valid SVG XML, retained placeholders, and matching dataset totals. It checks structure and the presence of descriptions; a human must judge their quality. External URLs are listed for separate verification rather than requiring network access during local checks.

JavaScript syntax checks, with Node:

```sh
node --check assets/js/app.js
node --check scripts/serve.mjs
```

The delivery was also tested in a real headless Edge/Chromium browser for reflow, navigation, images, quiz scoring, retries, saved state, storage failures, and JavaScript-disabled behavior. [QA.md](docs/QA.md) records the results. No browser-testing dependency is required to run or host the module.

To repeat the optional browser checks, keep `npm start` running in another terminal, then run:

```sh
npm install --no-save playwright
npx playwright install chromium
npm run test:browser
```

This refreshes screenshots and `docs/browser-results.json`. For an installed Microsoft Edge browser, set `CELLWISE_BROWSER=msedge` in your shell to skip downloading Chromium. The delivered tests ran with Playwright 1.62.1 and Edge 156.0.4314.50. Browser checks create a fresh isolated browser context and reset only that context’s demo progress.

## Deploy

Upload the project’s HTML files and `assets/` folder to an HTTPS static host, preserving names and relative paths. There is no build step and no backend to configure. The same files work at a domain root or a subdirectory. Disable a host’s SPA rewrite: these are real, separate HTML pages.

The included `_headers` file sets a Content Security Policy and other response headers on hosts that support that format (such as Cloudflare Pages or Netlify). For other hosts, set equivalent headers in their configuration. The local Node preview sends the same headers. Revisit the policy if you add third-party fonts, embeds, scripts, analytics, or APIs. Do not run the preview server as a public production service.

## Resources and credits

Lesson text and SVG diagrams were created for this independent educational example. Microsoft resource links were verified on **28 October 2026**:

- [Basic tasks in Excel](https://support.microsoft.com/en-us/excel/basic-tasks-in-excel)
- [Create a simple formula in Excel](https://support.microsoft.com/en-us/excel/create-a-simple-formula-in-excel)
- [Sort data in a range or table](https://support.microsoft.com/en-us/excel/sort-data-in-a-range-or-table-in-excel)
- [Create a chart from start to finish](https://support.microsoft.com/en-us/excel/get-started/create-a-chart-from-start-to-finish)

Excel is a Microsoft product. Cellwise is an independent demo with no Microsoft affiliation. Menu names can vary across Excel versions. Code, original text, diagrams, and the example dataset are provided under the MIT license; external resources retain their own terms.

## Portfolio description

“Designed and developed a responsive five-lesson Excel learning module using semantic HTML, reusable CSS components, and vanilla JavaScript. Implemented accessible navigation, local progress tracking, a scored quiz with explanatory feedback, and progressive enhancement. Validated local links, responsive layouts, keyboard interactions, and storage failure behavior.”
