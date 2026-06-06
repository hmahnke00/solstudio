# Sol Studio — Gallery Grid Fix & Image Compression

Kanban board generated from `PRD_gallery_grid_fix.md`.

---

## Backlog

### T5 — Visual sign-off

**Type**: AFK  
**Blocked by**: T1, T2, T3, T4

#### What to build

Load the live gallery page in a browser using Claude in Chrome and capture screenshots for human review. Verify the grid renders correctly at desktop width, images load at acceptable speed, the lightbox opens full-resolution images, and mobile layout is unaffected. Deliver annotated screenshots covering each criterion below so the site owner can approve before merge.

#### Acceptance criteria

- [ ] Screenshot: gallery at 1440px — grid visibly fills ~90% of horizontal space
- [ ] Screenshot: gallery at 1440px — no collapsed strip or empty white space on the right
- [ ] Screenshot: lightbox open on a clicked image — full-res image displayed, prev/next/close controls visible
- [ ] Screenshot: gallery at 390px — single-column vertical layout intact, no regression
- [ ] Screenshot: DevTools Network panel showing grid images loading from `thumbnails/` path
- [ ] Site owner reviews and approves all screenshots

---

## In Progress

*(none)*

---

## Done

### T1 — Fix nav selector crash

**Type**: AFK  
**Blocked by**: None — can start immediately

#### What to build

Patch the single broken selector in `gallery.js` that causes `setColumnWidth()` to throw a TypeError on every page load. The fix is changing `.gallery-header` to `.site-nav` so the nav height is measured correctly and the grid receives its dimensions.

#### Acceptance criteria

- [x] Test (written first): `gallery.js` does NOT reference `.gallery-header` (regression guard)
- [x] Test (written first): `gallery.js` references `.site-nav`
- [x] Test (written first): `document.querySelector('.gallery-header')` returns null in `gallery.html` (regression guard) — covered by existing T3 suite
- [x] Test (written first): `document.querySelector('.site-nav')` returns a non-null element in `gallery.html` — covered by existing T3 suite
- [x] Selector updated from `.gallery-header` to `.site-nav` in `gallery.js`
- [x] Dead `var section` variable removed
- [x] All tests pass

---

### T2 — 90% viewport fill calculation

**Type**: AFK  
**Blocked by**: T1 — Fix nav selector crash

#### What to build

Update `setColumnWidth()` in `gallery.js` to guarantee the full grid width is at least 90% of the viewport on initial load. Introduce a `FILL_TARGET` constant (0.90) at the top of the IIFE. Column width becomes the larger of the aspect-ratio-derived width and a minimum width computed from the fill target.

#### Acceptance criteria

- [x] Test (written first): `FILL_TARGET` constant defined in `gallery.js`
- [x] Test (written first): `setColumnWidth` uses `Math.max` for fill-target vs aspect-ratio width
- [x] Test (written first): `FILL_TARGET` value is 0.90
- [x] `FILL_TARGET = 0.90` constant defined at the top of the IIFE
- [x] `colW` uses `Math.max(aspectRatioWidth, minFillWidth)` formula
- [x] All tests pass

---

### T3 — Thumbnail compression script

**Type**: AFK  
**Blocked by**: None — can start immediately (parallel with T1/T2)

#### What to build

Write `scripts/compress-thumbnails.sh` — an idempotent ImageMagick script that reads every `.jpg` in `gallery_photos/` and writes a compressed copy to `gallery_photos/thumbnails/`. Spec: 800px max width, JPEG quality 82, EXIF stripped, output filename identical to source. Skips files where the thumbnail is already newer than the source.

#### Acceptance criteria

- [x] Test (written first): every filename in `GALLERY_DATA` has a matching file in `gallery_photos/thumbnails/`
- [x] Test (written first): every thumbnail is strictly smaller in bytes than its full-res source
- [x] Test (written first): no thumbnail file exceeds 150KB
- [x] `scripts/compress-thumbnails.sh` exists and is executable
- [x] Script is idempotent — re-running does not re-process up-to-date thumbnails
- [x] All 30 thumbnails committed to `gallery_photos/thumbnails/`
- [x] All tests pass

---

### T4 — Wire thumbnails into gallery data & JS

**Type**: AFK  
**Blocked by**: T3 — Thumbnail compression script

#### What to build

Add a `thumbnail` field to every entry in `gallery-data.js`. Update `buildGrid()` in `gallery.js` to resolve grid `<img>` src as `gallery_photos/thumbnails/` + `photo.thumbnail || photo.filename`. The lightbox `refreshLightbox()` must continue resolving to `gallery_photos/` + `photo.filename` (full-res, unchanged).

#### Acceptance criteria

- [x] Test (written first): `buildGrid` in `gallery.js` resolves img src from `thumbnails/` path
- [x] Test (written first): `refreshLightbox` in `gallery.js` uses full-res `gallery_photos/` (not `thumbnails/`)
- [x] Test (written first): all 30 `GALLERY_DATA` entries have a `thumbnail` field
- [x] `thumbnail` field added to all 30 entries in `gallery-data.js`
- [x] `buildGrid()` updated to use `thumbnails/` prefix for grid images
- [x] `refreshLightbox()` unchanged — continues to use full-res path
- [x] All tests pass
