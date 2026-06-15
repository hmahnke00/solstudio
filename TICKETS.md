# Sol Studio — Gallery Improvements

Kanban board generated from `GALLERY_IMPROVEMENTS_PRD.md`.

---

## Backlog

### T1 — Layout Foundation: Sidebar Column + buildGrid Refactor

**Type**: AFK
**Blocked by**: None — can start immediately

#### What to build

Introduce a `<aside class="gallery-sidebar">` element in `gallery.html` containing the Sol Studio sun logo (linking to home). Define `--sidebar-width: 160px` as a CSS custom property on `:root` in `css/tokens.css`. The sidebar sits as a fixed-width left column in document flow — not an overlay.

Refactor `buildGrid()` in `gallery.js` to accept a photo array argument instead of always using the module-scoped `photos` variable. Update `setColumnWidth()` to read `gallerySection.clientWidth` instead of `window.innerWidth` so the sidebar width is naturally excluded from the fill calculation.

#### Acceptance criteria

- [ ] `--sidebar-width` custom property defined in `css/tokens.css`
- [ ] `<aside class="gallery-sidebar">` exists in `gallery.html` with Sol Studio logo link
- [ ] `buildGrid(data)` accepts a photo array argument
- [ ] `setColumnWidth()` reads from `gallerySection.clientWidth`, not `window.innerWidth`
- [ ] Grid renders correctly with sidebar taking left column space
- [ ] All existing tests pass

---

### T2 — Filter Logic: filterPhotos Function + Unit Tests

**Type**: AFK
**Blocked by**: None — can start immediately (parallel with T1)

#### What to build

Extract `filterPhotos(data, filterState)` as a pure exported function in a new `js/gallery-filter.js` module. `filterState` is `{ series: string|null, environment: string|null }`. A `null` axis matches all photos on that axis. Two active filters use AND intersection. Also implement `deriveFilterValues(data)` which returns `{ series: string[], environment: string[] }` — unique sorted values extracted dynamically from the data array.

Write unit tests for both functions in `tests/run_tests.js` following the existing pattern (no DOM, no browser — pure Node).

#### Acceptance criteria

- [ ] `filterPhotos(data, { series: null, environment: null })` returns all 30 photos
- [ ] `filterPhotos(data, { series: 'witness', environment: null })` returns only witness photos
- [ ] `filterPhotos(data, { series: 'contact', environment: 'mountain' })` returns only the AND intersection (sierra-hiker-snow.jpg)
- [ ] `filterPhotos(data, { series: 'witness', environment: 'coastal' })` returns only matching photos
- [ ] `filterPhotos(data, { series: 'small', environment: 'ocean' })` returns empty array (no match)
- [ ] `deriveFilterValues(data)` returns sorted unique series and environment arrays
- [ ] All tests pass

---

### T3 — Filter UI Panel: Toggle, Radio Buttons, Scroll Collapse

**Type**: AFK
**Blocked by**: T1 (sidebar layout), T2 (filterPhotos function)

#### What to build

Add the filter toggle button and filter panel inside the `.gallery-sidebar`. The panel contains two `<fieldset>` elements — one for `series`, one for `environment` — each with radio buttons. "All" is the default selected option for each axis. Filter values are derived dynamically from `GALLERY_DATA` via `deriveFilterValues()` at page load. Display labels are title-cased (e.g. `"witness"` → `"Witness"`).

Wire the radio button state to `filterPhotos()` → `buildGrid()` → `setColumnWidth()` so the grid rebuilds immediately on filter change. Add scroll-aware collapse: when the gallery section scrolls horizontally, the filter panel gets a `filter-panel--collapsed` CSS class; class is removed on scroll-end (debounced) or when the cursor re-enters the sidebar. All filter controls are keyboard accessible.

#### Acceptance criteria

- [ ] Filter panel renders series and environment options derived dynamically from `GALLERY_DATA`
- [ ] Display labels are title-cased
- [ ] Selecting a series filter rebuilds the grid with only matching photos
- [ ] Selecting an environment filter rebuilds the grid with only matching photos
- [ ] Two active filters apply AND intersection
- [ ] Clicking an active radio again (or selecting "All") returns the full gallery
- [ ] Filter panel collapses on horizontal scroll and reappears on scroll-end or sidebar hover
- [ ] Filter controls are navigable by keyboard (Tab + arrow keys)
- [ ] All tests pass

---

### T4 — Caption Hover Overlays

**Type**: AFK
**Blocked by**: T1 (buildGrid refactor)

#### What to build

Inject a `<figcaption>` element inside each `.grid-item` figure in `buildGrid()`. The figcaption renders `series` and `location` separated by an em dash. When `location` is empty string, render only `series` with no trailing separator.

CSS in `style_gallery.css` handles the overlay: `position: absolute; bottom: 0`, gradient background from `transparent` to `rgba(0,0,0,0.52)`, white Inter text at 11–12px. Default opacity `0`; on `.grid-item:hover figcaption` opacity becomes `1`. Transition: `opacity 200ms ease`. Under `prefers-reduced-motion: reduce`, the transition is removed. The lightbox remains image-only — no captions there.

#### Acceptance criteria

- [ ] Hovering a grid image reveals series and location text
- [ ] Caption appears as a gradient overlay from the bottom of the image
- [ ] Caption fades in smoothly (200ms) on hover
- [ ] Photos with empty `location` show only the series name (no trailing separator)
- [ ] `prefers-reduced-motion: reduce` disables the opacity transition
- [ ] Lightbox has no caption
- [ ] All tests pass

---

### T5 — Nav Collapse Toggle

**Type**: AFK
**Blocked by**: T1 (setColumnWidth refactor)

#### What to build

Add a `<button class="nav-collapse-toggle">` to the right side of `.site-nav` in `gallery.html` only (not in shared nav markup on other pages). The button uses a minimal CSS-only chevron or Unicode character — no additional image assets.

On click: toggle `nav-hidden` on `document.body`. CSS in `style_gallery.css` (not `nav.css`): `.nav-hidden .site-nav { transform: translateY(-100%); transition: transform 300ms ease; }`. On `mousemove` where `clientY < 8`: remove `nav-hidden`. After the nav transition ends (`transitionend`), call `setColumnWidth()` so the grid height recalculates against the updated `header.offsetHeight`.

#### Acceptance criteria

- [ ] Nav collapse toggle button visible in gallery nav only
- [ ] Clicking toggle slides nav off-screen
- [ ] Clicking toggle again (or moving mouse to top 8px) slides nav back
- [ ] Grid height recalculates after nav transition completes
- [ ] Nav collapse styles live in `style_gallery.css`, not `nav.css`
- [ ] About and Contact pages are unaffected
- [ ] All tests pass

---

### T6 — Mobile Filter UX

**Type**: HITL
**Blocked by**: T3 (filter UI panel)

#### What to build

Design decision needed: on viewports ≤ 768px, the left sidebar cannot occupy horizontal space without crushing the gallery. Choose between a bottom drawer (slides up from bottom edge, triggered by a floating filter button) or a top dropdown (collapses from below the nav). Once the approach is decided, implement so filters don't consume vertical space by default on mobile.

#### Acceptance criteria

- [ ] Human selects: bottom sheet or dropdown
- [ ] Filter controls accessible on mobile without sidebar eating into gallery space
- [ ] Selected approach implemented and tested on a 390px viewport
- [ ] All tests pass

---

## In Progress

*(none)*

---

## Done

*(none)*
