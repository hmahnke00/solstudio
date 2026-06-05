# Sol Studio — Tickets

## Backlog

---

### T1 — Update design tokens

**Type**: AFK  
**Blocked by**: None — can start immediately

#### What to build

Update the single source-of-truth token file so every page inherits the new white background and lighter surface color. Add a `--nav-height` token that the nav and all page layouts will reference for top-padding clearance.

#### Acceptance criteria

- [ ] `--bg` is `#FFFFFF` in `tokens.css`
- [ ] `--surface` is `#F2F2F2` in `tokens.css`
- [ ] `--nav-height` is defined as `56px` in `tokens.css`
- [ ] All four pages display a white background (not eggshell) when viewed at 1440px and 390px viewport widths

---

### T2 — Build global nav component

**Type**: AFK  
**Blocked by**: T1 — Update design tokens

#### What to build

Create a standalone `css/nav.css` stylesheet and a reusable HTML nav snippet. The nav is a sticky top bar: Sol Studio logo/mark on the left, three text links (Gallery · About · Contact) on the right. Active-page link is visually distinguished. Does not yet need to be dropped into any page — this ticket produces the component and its styles in isolation.

#### Acceptance criteria

- [ ] `css/nav.css` exists and contains all nav styles
- [ ] Nav bar is 56px tall on desktop, 48px on mobile (≤ 768px)
- [ ] Background is `#FFFFFF` with a 1px bottom border using `--border` token
- [ ] Links use Inter, uppercase, ~13–14px, letter-spacing ~0.08em
- [ ] Active link state is visually distinct (underline or heavier weight)
- [ ] Nav is sticky/fixed at the top of the viewport
- [ ] No page imports `nav.css` yet — verified by checking all HTML files

---

### T3 — Integrate nav into all four pages

**Type**: AFK  
**Blocked by**: T2 — Build global nav component

#### What to build

Drop the shared nav HTML block into all four pages (index, about, gallery, contact). Remove the existing bottom nav from the home page. Remove the gallery page's existing logo-only header. Ensure each page's main content starts below the fixed nav — add `padding-top: var(--nav-height)` (or equivalent) to each page's top-level content container.

#### Acceptance criteria

- [ ] `index.html`, `about.html`, `gallery.html`, `contact.html` all include the nav HTML block
- [ ] Home page bottom nav (`<nav class="site-nav">`) is removed
- [ ] Gallery page's existing `.gallery-header` is replaced by the global nav
- [ ] No page's content is hidden behind the fixed nav bar at 1440px or 390px
- [ ] Active link correctly identifies the current page on each of the four pages

---

### T4 — Refactor About page layout

**Type**: AFK  
**Blocked by**: T3 — Integrate nav into all four pages

#### What to build

Rewrite `about.css` to use clean grid/flexbox flow. The layout retains the two-column split (photo left ~55%, text+logo right ~45%) but removes all absolute-position nudge hacks (`--about-text-nudge-x`, `--about-picture-shift-x`, etc.). The Sol Studio logo icon is placed in document flow in the right column above the body text. The vertical "SOL STUDIO" label remains as a decorative accent but must not overlap any other element. The background watermark sun stays at low opacity and is non-interactive. Fix the mobile breakpoint from `max-width: 0px` to `max-width: 768px` so the single-column stacked layout actually fires on mobile.

#### Acceptance criteria

- [ ] No CSS `translate()` nudge variables remain in `about.css`
- [ ] No elements overlap at 1440px, 1024px, or 768px viewport widths
- [ ] Logo icon is visible and in document flow (not `position: absolute`)
- [ ] Vertical "SOL STUDIO" label does not overlap the image or text
- [ ] Content clears the nav bar (minimum 80px below nav)
- [ ] Mobile breakpoint fires at `max-width: 768px`
- [ ] On mobile (390px): single-column stack — image → logo → text, no overflow

---

### T5 — Gallery whitespace

**Type**: AFK  
**Blocked by**: T3 — Integrate nav into all four pages

#### What to build

Add breathing room above and below the gallery image grid. The current `overflow: hidden` on `body` clips the nav — move it to `.gallery-section` only. Add 48–64px `padding-top` above the grid and `padding-bottom` below it. Image gap stays at 2px.

#### Acceptance criteria

- [ ] `body` no longer has `overflow: hidden` in `style_gallery.css`
- [ ] `.gallery-section` clips its own overflow
- [ ] Visible whitespace (≥ 48px) exists above the first row of images at 1440px
- [ ] Visible whitespace (≥ 48px) exists below the last row of images at 1440px
- [ ] Gap between individual photos is unchanged at ≈ 2px
- [ ] Nav bar is fully visible and not clipped

---

### T6 — Mobile-first pass: Home + Contact

**Type**: AFK  
**Blocked by**: T3 — Integrate nav into all four pages

#### What to build

Home page: confirm the hero image fills the viewport at 390px, the brand mark (logo + wordmark) scales correctly, and the global nav replaces the removed bottom nav cleanly. Contact page: audit `contact.css` at 390px — all form inputs should be full-width, labels readable, no horizontal overflow.

#### Acceptance criteria

- [ ] Home page hero fills 100vw × 100vh at 390px with no horizontal scroll
- [ ] Brand mark is legible and proportional at 390px
- [ ] Contact page has no horizontal overflow at 390px
- [ ] All form inputs on Contact are full-width (`width: 100%`) at 390px
- [ ] Both pages pass a visual check at 768px (tablet)

---

### T7 — Mobile-first pass: Gallery

**Type**: AFK  
**Blocked by**: T5 — Gallery whitespace

#### What to build

On mobile (≤ 768px), replace the 3-row horizontal scroll grid with a single-column vertically scrolling layout. Images fill the full viewport width with 16px horizontal padding on each side. Lightbox must remain openable and closable on mobile (swipe/touch navigation is a stretch goal, not required).

#### Acceptance criteria

- [ ] At ≤ 768px: gallery renders as a single-column vertical scroll, not a 3-row horizontal scroll
- [ ] Images have 16px padding on left and right at 390px
- [ ] No horizontal scroll on mobile
- [ ] Lightbox opens and closes on mobile (tap to open, close button functional)
- [ ] At > 768px: 3-row horizontal scroll layout is unchanged

---

## In Progress

---

## Done

---
