# PRD: Gallery Page Improvements

**Status:** Ready for implementation  
**Scope:** `gallery.html`, `gallery.js`, `gallery-data.js`, `style_gallery.css`, `nav.css`

---

## Problem Statement

The Sol Studio gallery page presents photos in a clean 3-row horizontal scroll grid, but lacks the navigational and contextual features that professional photography portfolios need. Visitors cannot filter by subject or environment, have no way to identify what they are looking at without clicking into the lightbox, and the navigation bar permanently occupies vertical space that could otherwise be given to the images. As the photo collection grows, the current gallery becomes harder to navigate and less effective at showcasing the range of work.

---

## Solution

Introduce three improvements that bring the gallery closer to reference-quality photography portfolios (e.g. jimmychin.com/stills):

1. **Left sidebar** — a fixed-width left column housing the Sol Studio logo mark and a toggleable filter panel, giving visitors two filter axes (`series` and `environment`) to self-select into relevant work.
2. **Caption hover overlays** — a gradient overlay that appears on hover for each grid image, surfacing `series` and `location` directly in the grid without disrupting the visual experience.
3. **Nav collapse** — a toggle inside the nav bar that slides the nav off-screen, maximising image real estate; the nav returns automatically when the mouse approaches the top of the viewport.

---

## User Stories

1. As a visitor, I want to filter the gallery by series, so that I can view only the body of work most relevant to me (e.g. "Witness" vs "Contact").
2. As a visitor, I want to filter the gallery by environment, so that I can browse only ocean, mountain, or coastal shots.
3. As a visitor, I want active filters to be visually distinct from inactive ones, so that I always know which filter is applied.
4. As a visitor, I want to clear a filter by clicking it again, so that I can return to the full gallery without hunting for a reset button.
5. As a visitor, I want the gallery to immediately reflow when I apply a filter, so that I only see matching images with no empty slots.
6. As a visitor, I want the Sol Studio logo to remain visible on the left sidebar when I am browsing the gallery, so that the brand is anchored even when the nav is hidden.
7. As a visitor, I want the filter list to collapse while I am scrolling through the gallery, so that it does not distract from the images.
8. As a visitor, I want the filter list to reappear when I stop scrolling or move back to the left panel, so that I can filter again without hunting for controls.
9. As a mobile visitor, I want to access filters via a bottom sheet or dropdown, so that filters do not eat into the limited vertical space on my device.
10. As a visitor, I want to hover over a grid image and see its series and location, so that I can understand what I am looking at without clicking into the lightbox.
11. As a visitor, I want the caption to appear as a gradient overlay from the bottom of the image, so that it feels editorial and does not disrupt the composition.
12. As a visitor, I want the caption to fade in smoothly on hover, so that the interaction feels polished rather than abrupt.
13. As a visitor, I want the lightbox to remain image-only with no captions, so that the full-screen view stays clean and focused.
14. As a visitor, I want to hide the navigation bar while viewing the gallery, so that images fill as much of the viewport as possible.
15. As a visitor, I want a small toggle button inside the nav bar to trigger the hide, so that the control is predictable and discoverable.
16. As a visitor, I want the nav to slide back into view when I move my mouse to the top of the screen, so that I can navigate away without needing to remember a keyboard shortcut.
17. As a visitor, I want the nav hide/show behaviour to apply only to the gallery page, so that other pages (About, Contact) behave normally.
18. As a visitor, I want the grid to recalculate its height when the nav is hidden or shown, so that the 3-row layout always fills the available viewport correctly.
19. As a visitor with reduced-motion preferences set, I want all transitions (caption fade, nav slide, filter panel slide) to be disabled, so that the site respects my system settings.
20. As a keyboard user, I want to navigate the filter controls without a mouse, so that the gallery is accessible.

---

## Implementation Decisions

### Layout architecture

The gallery page layout shifts from a single full-width column to a two-column composition:

- **Left column**: fixed width (approximately 160–200px), always reserving space in the layout. Contains the Sol Studio sun logo mark at top, followed by the filter toggle and filter list below.
- **Right column**: the gallery section (`gallery-section`) takes all remaining width. The gallery grid fills this column as it does today — the JS column-width calculation must account for the left sidebar width rather than the full `window.innerWidth`.

The left column is not an overlay; it is part of the document flow. This keeps the gallery grid dimensions stable when the filter panel opens or closes.

### Module: `gallery-filter`

A new JS module responsible for all filter state and rendering. Key decisions:

- **Filter values are derived dynamically** from `GALLERY_DATA` at page load — no hardcoded category lists. Unique values for `series` and `environment` are extracted and sorted.
- **State shape**: one active value per axis, or `null` for "All". E.g. `{ series: 'witness', environment: null }`.
- **Intersection logic**: a photo matches if it satisfies both active filters simultaneously (AND, not OR). A `null` axis matches all photos on that axis.
- **Grid rebuild**: on any filter change, the module calls `buildGrid(filteredPhotos)` — the existing `buildGrid` function in `gallery.js` is refactored to accept a photo array argument rather than always using the full `GALLERY_DATA`. After rebuilding, `setColumnWidth()` is called to recalculate grid dimensions.
- **Scroll-aware collapse**: the filter list element adds a CSS class (e.g. `filter-panel--collapsed`) when horizontal scroll is detected on the gallery section. The class is removed on a debounced scroll-end or when the cursor re-enters the left sidebar.

### Module: `gallery-sidebar` (HTML + CSS)

A new `<aside class="gallery-sidebar">` element wraps:
- `<a class="sidebar-logo">` — Sol Studio sun mark (the existing `solstudiocutout.png`), links to home
- `<button class="filter-toggle">` — opens/closes the filter list
- `<div class="filter-panel">` — contains two `<fieldset>` elements, one per axis (series, environment), each with radio buttons. "All" is the default selected option for each axis.

The sidebar is `position: sticky; top: 0; height: 100vh` so it stays in view during horizontal scroll.

### Module: `caption-overlay` (CSS only)

Each `.grid-item` (already a `<figure>`) gains an inner `<figcaption>` injected by `buildGrid`. The figcaption contains `series` and `location` text, separated by an em dash or slash.

CSS handles the overlay:
- `figcaption` is `position: absolute; bottom: 0; left: 0; right: 0`
- Background: linear gradient from `transparent` at top to `rgba(0,0,0,0.52)` at bottom
- Text: white, Inter, 11–12px, letter-spaced
- Default opacity: `0`; on `.grid-item:hover figcaption`: opacity `1`
- Transition: `opacity 200ms ease`
- Respects `prefers-reduced-motion: reduce` (transition removed)

Photos where `location` is empty string should render only the `series` value, with no trailing separator.

### Module: `nav-collapse` (JS + CSS, gallery page only)

A `<button class="nav-collapse-toggle">` is added to the right side of `.site-nav` in `gallery.html` only (not in the shared nav partial used on other pages, since the nav is inlined HTML).

Behaviour:
- On click: `document.body.classList.toggle('nav-hidden')`
- CSS: `.nav-hidden .site-nav { transform: translateY(-100%); transition: transform 300ms ease; }` — the nav slides up off-screen
- On `mousemove` near the top edge (e.g. `clientY < 8px`): remove `nav-hidden` class, snapping the nav back
- The gallery JS `setColumnWidth()` must be called after the nav transition ends (`transitionend` event) so the grid height recalculates against the new `header.offsetHeight` (which becomes 0 when nav is hidden)

The collapse toggle icon should be minimal — a small chevron or two horizontal lines — using only CSS or a Unicode character, no additional image assets.

### `gallery-data.js` — no schema changes required

All filter fields (`series`, `environment`, `location`) already exist on every photo object. No new fields are needed. However, `location` is empty string on two photos (`lake-ripples.jpg`, `ocean-surface.jpg`) — the caption rendering must handle this gracefully.

### `setColumnWidth()` — updated inputs

Currently reads `window.innerWidth` for the fill calculation. Must instead read the width of the gallery section element (i.e. `gallerySection.clientWidth`) so the left sidebar width is naturally excluded.

---

## Testing Decisions

Good tests check external behaviour — what the module produces — not how it is internally structured. Tests should not depend on CSS class names or DOM structure beyond what is specified in the interface contract.

**What makes a good test here:**
- Given a `GALLERY_DATA` array and an active filter state, assert that `filterPhotos(data, state)` returns the correct subset.
- Given an empty filter state (`{ series: null, environment: null }`), assert that all photos are returned.
- Given a filter state where no photos match, assert that an empty array is returned (grid renders empty gracefully).

**Modules to test:**

- **`filterPhotos(data, filterState)`** — pure function, no DOM dependency. Accepts the full data array and a `{ series, environment }` state object, returns a filtered array. This is the highest-value test target because it encodes the AND intersection logic that is easy to get wrong.
- **Caption content rendering** — given a photo object where `location` is empty, assert that the rendered `figcaption` text does not contain a trailing separator.
- **`setColumnWidth()` input** — after sidebar is introduced, assert that the column width is calculated from `gallerySection.clientWidth` rather than `window.innerWidth`.

Test file location should follow the existing pattern in `tests/run_tests.js`.

---

## Out of Scope

- Multi-select filters (selecting multiple series or environments simultaneously)
- Filter state persistence across page navigation (e.g. via URL params or localStorage)
- Captions in the lightbox
- Nav collapse behaviour on About or Contact pages
- Adding or editing photo metadata from the UI — `gallery-data.js` remains the source of truth, edited manually
- Thumbnail generation or image optimisation pipeline changes
- Dark mode adjustments to the sidebar or caption overlay (tokens already handle dark mode colours if it is introduced later)

---

## Further Notes

- **Placement reference**: A mockup confirms the sidebar spatial layout — Sol Studio sun logo sits at the top of the left column, with the filter toggle and filter list below it. The logo remains small (matching the current nav logo size, ~28–40px). The sidebar has a white background consistent with the rest of the page chrome.
- The left sidebar width should be defined as a CSS custom property (e.g. `--sidebar-width: 160px`) on `:root` in `tokens.css` so that `gallery.js` can read it via `getComputedStyle` without hardcoding a pixel value.
- The filter toggle button and filter panel interaction is scoped entirely to the gallery page. The global `nav.css` file should not be modified — nav-collapse styles should live in `style_gallery.css` under a `.nav-hidden` selector.
- Series names in the current data (`contact`, `small`, `witness`) are lowercase slugs. Display labels in the filter UI should be title-cased: "Contact", "Small", "Witness". The same applies to environment values: "Ocean", "Coastal", "Mountain", "Lake".
- As the photo collection grows beyond the current 30 images, the filter value derivation from `GALLERY_DATA` ensures new series or environments appear in the filter UI automatically without code changes.
