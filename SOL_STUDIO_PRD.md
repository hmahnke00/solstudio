# Sol Studio Website — Product Requirements Document
**Version:** 1.0  
**Date:** June 5, 2026  
**Author:** Henry Mahnke  
**Reference inspiration:** jimmychin.com

---

## 1. Overview

Sol Studio is a photography portfolio site built with vanilla HTML/CSS/JS. This PRD covers a focused visual and structural update to bring the site closer to the editorial, minimal aesthetic of Jimmy Chin's website — clean white space, uncluttered layouts, consistent navigation, and mobile-first responsiveness.

The site consists of four pages: **Home**, **Gallery**, **About**, and **Contact**.

---

## 2. Goals

- Remove visual clutter and overlapping elements — especially on the About page
- Shift the global background from warm eggshell (`#F4F1EC`) to pure white (`#FFFFFF`)
- Add a consistent, minimal top navigation bar to every page
- Give the Gallery page breathing room above and below the image grid
- Repair and redesign the mobile experience across all pages (currently broken)

---

## 3. Non-Goals

- No changes to photography content or copy
- No new pages or sections
- No backend, CMS, or e-commerce work in this iteration
- No font change (Slackside One + Inter remain; typography sizing/weight tuning is in scope)

---

## 4. Requirements

### 4.1 Global: Background Color

**Problem:** `tokens.css` sets `--bg: #F4F1EC` (warm eggshell). The home page `styles_update.css` overrides `body` to `background: #000`. Each page has slightly different background behavior.

**Requirement:**
- Change `--bg` in `tokens.css` to `#FFFFFF`
- Audit all per-page CSS files and remove any local `background-color` overrides that conflict with the token
- The home page hero can retain its full-bleed background image; the page chrome (nav, any visible margin) should be white not black or eggshell
- `--surface` token (`#EDEAE4`) should shift to `#F2F2F2` to maintain the light card/surface distinction

**Acceptance criteria:** Every page background, when not covered by a photo, reads as white in a browser at 1440px and 390px viewport widths.

---

### 4.2 Global: Navigation Bar

**Problem:** The home page has a bottom nav. The gallery page has a top header with only a logo. About and Contact have no navigation at all.

**Requirement:**
- Implement a single shared nav component (or consistent HTML block) used on every page
- Style: minimal top bar — Sol Studio logo/mark on the left, page links on the right
  - Links: Gallery · About · Contact
  - Active page link is visually distinguished (e.g. underline or slightly heavier weight)
- Nav is sticky/fixed at the top
- Background: white (`#FFFFFF`) with a subtle 1px bottom border (`--border` token)
- Font: Inter, uppercase, letter-spacing ~0.08em, size ~13–14px
- Nav height: ~56px on desktop, ~48px on mobile
- Home page: nav sits above the hero image (hero image starts below nav, not behind it)
- Remove the existing bottom nav from the home page once the global top nav is in place

**Acceptance criteria:** Navigating to any of the four pages shows the same top nav. The current page link is visually active. Nav does not overlap content.

---

### 4.3 About Page: Fix Layout Overlap

**Problem:** The current layout uses a CSS grid with absolute positioning, a floating center logo, and multiple `translate()` nudge variables (`--about-text-nudge-x: -100px`, `--about-picture-shift-x: 60px`, etc.). At certain viewport widths the logo overlaps the text block and the image overflows its column. The mobile breakpoint is set to `max-width: 0px`, making it completely non-functional on mobile.

**Requirement:**
- Retain the two-column layout concept: large photo on the left (~55% width), text on the right (~45% width)
- Remove all absolute-position nudge hacks. Layout must be achieved with normal grid/flexbox flow
- The Sol Studio center logo should be placed in document flow — not absolutely positioned. Suggested placement: between the image and the text block, or anchored to the right column above the text
- The vertical "SOL STUDIO" text label remains as a design accent, but must not overlap any other element
- No element should overflow its column or overlap another at any viewport width ≥ 768px
- Add top padding to the about section so content doesn't slam into the nav bar (minimum 80px below nav)
- Watermark sun remains at low opacity in the background; it should not affect layout flow

**Acceptance criteria:** At 1440px, 1024px, and 768px viewport widths, no elements overlap. Text is fully readable. Logo is visible and not obscured.

---

### 4.4 Gallery Page: Whitespace

**Problem:** The gallery grid has `padding: 2px` and `gap: 2px`, and the body has `overflow: hidden`. There is no breathing room above or below the image grid.

**Requirement:**
- Add `padding-top` of 48–64px above the gallery grid (below the nav/header)
- Add `padding-bottom` of 48–64px below the gallery grid
- Maintain the existing 2px gap between images (user confirmed: keep tight gutters, just add outer padding)
- The horizontal scroll behavior can be retained on desktop
- The `overflow: hidden` on `body` should be replaced with a more targeted approach — only the `.gallery-section` should clip overflow, not the whole page, so the nav is not clipped

**Acceptance criteria:** At 1440px viewport, visible whitespace exists above the first row of gallery images and below the last row. The nav bar is fully visible and not clipped. Gap between individual photos is unchanged (≈2px).

---

### 4.5 Mobile-First Responsive Design

**Problem:** 
- `about.css` has its responsive breakpoint set to `max-width: 0px` — mobile overrides never fire
- `style_gallery.css` has no mobile breakpoint at all; the horizontal 3-row grid is unusable on phone
- The home page `styles_update.css` has a single `max-width: 480px` adjustment but no layout reflow

**Requirement — treat mobile (≤ 768px) as the primary design target:**

**Home page (mobile):**
- Brand mark (logo + wordmark) centered, appropriately sized for phone
- Nav links below the brand mark or accessible via a hamburger/compact layout
- Hero image fills the viewport

**About page (mobile):**
- Fix the `max-width: 0px` breakpoint — set to `max-width: 768px`
- Stack to single column: image full-width on top, logo centered below image, text below logo
- All nudge variables reset to 0 on mobile (already stubbed in code, just needs the correct breakpoint)
- Font size for body text: 16px minimum

**Gallery page (mobile):**
- Replace the 3-row horizontal scroll grid with a single-column vertical scroll layout on mobile
- Images fill the full viewport width with consistent padding (16px horizontal)
- Lightbox remains functional on mobile (touch/swipe support is a stretch goal)

**Contact page (mobile):**
- Verify form fields and layout are usable at 390px width
- Input fields should be full-width on mobile

**Acceptance criteria:** All four pages are functional and visually correct at 390px (iPhone 14 Pro) and 768px (tablet) viewport widths.

---

## 5. Design Tokens to Update

| Token | Current | New |
|---|---|---|
| `--bg` | `#F4F1EC` | `#FFFFFF` |
| `--surface` | `#EDEAE4` | `#F2F2F2` |
| Nav height (new) | — | `56px` desktop / `48px` mobile |

All other tokens (typography, border, text color) remain unchanged.

---

## 6. Files Affected

| File | Change type |
|---|---|
| `css/tokens.css` | Update `--bg` and `--surface` |
| `css/styles_update.css` | Remove black background; add nav integration for home |
| `css/about.css` | Full layout refactor — remove nudge variables, fix breakpoint |
| `css/style_gallery.css` | Add top/bottom padding; add mobile breakpoint |
| `css/contact.css` | Audit and fix mobile layout |
| `index.html` | Remove bottom nav; add global top nav HTML |
| `about.html` | Add global top nav HTML; restructure layout elements |
| `gallery.html` | Update header to use global nav pattern |
| `contact.html` | Add global top nav HTML |
| `css/nav.css` *(new)* | Shared nav component styles |

---

## 7. Out of Scope / Future Iterations

- Print ordering / e-commerce (prints.html does not yet exist)
- Dark mode (theme-toggle.js exists but is not wired to any UI)
- Image lazy-loading or performance optimization
- Swipe/touch gestures in the lightbox
- SEO meta tags

---

## 8. Success Criteria

1. Every page loads with a white background at all viewport sizes
2. Every page has the same top nav bar with the active page indicated
3. The About page has zero element overlap at 768px, 1024px, and 1440px
4. The Gallery page has visible top and bottom padding around the image grid
5. All four pages are functional and visually clean at 390px mobile width
6. No existing CSS nudge hacks (`translate()` overrides, `max-width: 0px` breakpoints) remain in the codebase
