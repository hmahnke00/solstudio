# PRD: Gallery Grid Fix & Image Compression

**Version:** 1.0  
**Date:** April 24, 2026  
**Scope:** gallery.html, gallery.js, style_gallery.css, gallery_photos/

---

## Problem Statement

The gallery page is the primary showcase of Sol Studio's work, but it currently renders broken for all visitors. The 3-row horizontal scroll grid collapses into a narrow strip in the top-left corner of the viewport, leaving roughly 75% of the page as empty white space. The photography is invisible in any meaningful way.

The secondary issue is load performance: the 30 gallery images are served as full-resolution files directly from the `gallery_photos/` directory, with no thumbnail layer. Even though the individual file sizes are reasonable (128KB–602KB), the browser downloads full-resolution files to display small grid thumbnails, causing unnecessary data transfer and slow perceived load.

---

## Solution

Fix the JavaScript selector mismatch that prevents `setColumnWidth()` from running, update the column-width calculation so the initial grid view fills ~90% of the viewport width, and introduce a compressed thumbnail layer for the grid (while retaining full-resolution files for the lightbox).

---

## User Stories

1. As a gallery visitor, I want the image grid to fill the browser window on first load, so that I can immediately see the breadth of the photography portfolio.
2. As a gallery visitor, I want the grid to display correctly the first time I navigate to the page, so that I don't have to reload or resize to trigger a fix.
3. As a gallery visitor, I want the grid to resize correctly when I resize my browser window, so that the layout adapts to my viewport without breaking.
4. As a gallery visitor, I want the gallery images to load quickly, so that I can browse the portfolio without waiting for content to appear.
5. As a gallery visitor, I want the grid to show roughly 90% of the available horizontal space filled with images on initial load, so that the page feels intentionally designed rather than partially rendered.
6. As a gallery visitor, I want clicking a grid thumbnail to open the full-resolution image in the lightbox, so that I can view fine detail when I choose to.
7. As a gallery visitor, I want the grid to remain horizontally scrollable after the fix, so that I can browse all 30 photos in the existing scrolling layout.
8. As a gallery visitor on a slow connection, I want grid thumbnails to be small-enough files that most images are visible within 3 seconds, so that I get an immediate impression of the work without a long wait.
9. As a mobile visitor, I want the single-column vertical layout to continue working correctly after the fix, so that the mobile experience is unaffected by desktop changes.
10. As the site owner, I want image thumbnails generated at a consistent size and quality setting, so that the grid has a uniform visual weight across all photos.
11. As the site owner, I want the thumbnail generation process to be scriptable, so that adding new photos to the gallery doesn't require manual compression work.
12. As the site owner, I want the lightbox to continue showing full-resolution images, so that clients can evaluate image quality in detail.
13. As the site owner, I want the `gallery-data.js` manifest to support separate `filename` (full-res) and `thumbnail` (compressed) fields, so that the grid and lightbox can independently reference their respective file versions.

---

## Implementation Decisions

### Module 1: `gallery.js` — Nav Selector Fix

The root cause of the grid collapse is a selector mismatch. `setColumnWidth()` calls:

```js
var header = document.querySelector('.gallery-header');
```

The `gallery.html` nav uses `.site-nav` (from `nav.css`), not `.gallery-header`. The `.gallery-header` selector matches nothing, so `header` is `null`. The subsequent call to `header.offsetHeight` throws a `TypeError`, halting execution before `grid.style.height` or `grid.style.gridAutoColumns` are ever set. The grid renders with no explicit dimensions and collapses to its implicit content size.

**Decision:** Update the selector to `.site-nav`. No change to `setColumnWidth()` logic otherwise.

### Module 2: `gallery.js` — 90% Viewport Fill Calculation

The current column width formula is:

```js
var colW = Math.floor((rowH * 16) / 9);
```

This produces a 16:9 column based on available row height, with no relationship to the viewport width. At a typical desktop viewport (1440px) with 3 rows and 30 photos (10 columns), the total grid width may fall well short of the viewport width if the row height is small.

**Decision:** After computing `colW` from the aspect ratio, derive a minimum column width from the viewport fill target and take the larger of the two:

```js
var FILL_TARGET = 0.90;
var numCols     = Math.ceil(photos.length / rows);
var minColW     = Math.floor((window.innerWidth * FILL_TARGET) / numCols);
var colW        = Math.max(Math.floor((rowH * 16) / 9), minColW);
```

This ensures the initial view fills at least 90% of the viewport width when all columns are present, while preserving the aspect-ratio-driven sizing when it naturally produces wider columns (e.g., very tall viewports).

The `FILL_TARGET` constant is defined at the top of the IIFE so it can be adjusted without hunting through the calculation.

### Module 3: `gallery_photos/thumbnails/` — Compressed Thumbnail Layer

A new subdirectory `gallery_photos/thumbnails/` holds web-optimized JPEG versions of each gallery photo. Thumbnails are generated by a build script (`scripts/compress-thumbnails.sh`) using ImageMagick.

Target spec for thumbnails:
- Max width: 800px (height auto-scales, preserving aspect ratio)
- JPEG quality: 82
- Strip EXIF metadata (reduces file size, protects location data)
- Output filename: same basename as source (e.g., `california-surfer-backlit.jpg`)

Expected per-file size reduction: from a current range of 128KB–602KB down to approximately 40KB–120KB per thumbnail. Total gallery thumbnail payload: ~2MB vs. the current ~10MB for full-resolution files.

The script operates on all files in `gallery_photos/*.jpg` and writes output to `gallery_photos/thumbnails/`. It is idempotent — re-running does not overwrite files that are already up-to-date (checked via timestamp comparison).

### Module 4: `gallery-data.js` — Thumbnail Field

Each photo entry in `GALLERY_DATA` gains a `thumbnail` field:

```js
{
  "filename": "california-surfer-backlit.jpg",   // used by lightbox
  "thumbnail": "california-surfer-backlit.jpg",  // used by grid (resolved to thumbnails/ prefix)
  ...
}
```

In practice, thumbnail filenames always match the source filename, so the field can be omitted and defaulted in JS. However, making it explicit allows future cases where filenames differ (e.g., if a photo is replaced with a differently-named file).

`gallery.js` `buildGrid()` resolves thumbnail paths as `gallery_photos/thumbnails/` + `photo.thumbnail || photo.filename`. The lightbox `refreshLightbox()` continues to resolve paths as `gallery_photos/` + `photo.filename`.

### Module 5: `style_gallery.css` — No Changes Required

The CSS is correct. The grid layout, scroll behavior, and mobile breakpoint are all sound. The bug is entirely in the JS selector; no CSS changes are needed for the grid fix or fill target.

---

## Testing Decisions

Good tests for this feature verify **observable behavior at the DOM level**, not internal implementation details like variable values or function call sequences. Specifically: tests should assert what the grid looks like after JS runs, not how it calculates things internally.

### What to test

**`setColumnWidth` integration (gallery.js):**
- After `DOMContentLoaded`, `grid.style.height` is a non-zero pixel value
- After `DOMContentLoaded`, `grid.style.gridAutoColumns` is a non-zero pixel value
- After a simulated `resize` event, both values update

**Viewport fill (gallery.js):**
- At a mock `window.innerWidth` of 1440px with 30 photos, the computed `gridAutoColumns` value produces a total grid width ≥ 90% of `window.innerWidth`

**Thumbnail path resolution (gallery.js `buildGrid`):**
- Each rendered `<img>` `src` attribute contains `thumbnails/` in the path
- Lightbox `<img>` `src` (after `openLightbox`) does not contain `thumbnails/` — resolves to full-res

**Selector correctness:**
- `document.querySelector('.site-nav')` returns a non-null element in `gallery.html`
- `document.querySelector('.gallery-header')` is confirmed absent (to prevent regression of the original bug)

### Prior art

The existing `tests/run_tests.js` uses a lightweight vanilla JS test harness with no external dependencies. New tests for this PRD should follow the same pattern: set up a minimal DOM fragment, call the function under test, assert on DOM state.

---

## Out of Scope

- Lightbox image optimization (lightbox continues to load full-resolution files from `gallery_photos/`)
- WebP conversion or next-gen image format adoption
- CDN or asset hosting changes
- Changes to the mobile gallery layout (the existing single-column vertical scroll layout is correct and unaffected)
- Lazy-loading strategy changes (the existing `loading="lazy"` + `decoding="async"` attributes on grid images are already in place and remain unchanged)
- Gallery filtering, sorting, or series-based navigation
- Any changes to pages other than gallery.html

---

## Further Notes

- The existing `SOL_STUDIO_PRD.md` listed "Image lazy-loading or performance optimization" as out of scope for the v1.0 design pass. This PRD scopes that work in specifically for the gallery thumbnail layer, which is the highest-leverage optimization available given the gallery is the primary content of the site.
- The `compress-thumbnails.sh` script requires ImageMagick (`convert` or `magick`) to be installed locally. This is a local dev dependency only — the generated thumbnails are committed to the repo and served as static files, so no build step is required in production.
- The `FILL_TARGET` constant (0.90) is intentionally exposed at the top of the IIFE in `gallery.js` so it can be tuned without re-reading the layout math. A value between 0.85 and 0.95 is the expected operating range.
- With 30 photos / 3 rows = 10 columns at 90% fill on a 1440px viewport, each column will be approximately 130px wide. This is intentionally narrow — the grid is a contact sheet / browse experience, not a hero display. Full viewing happens in the lightbox.
