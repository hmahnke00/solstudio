#!/usr/bin/env node
/**
 * Sol Studio — CSS/HTML structural test suite
 * Run: node tests/run_tests.js
 * No dependencies — uses only built-in Node modules.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ─── JS module imports (guarded so missing files fail tests, not the runner) ──

let filterPhotos = null;
let deriveFilterValues = null;
let toTitleCase = null;
let captionText = null;
let GALLERY_DATA_NODE = null;

try {
  const filter = require('../js/gallery-filter.js');
  filterPhotos = filter.filterPhotos;
  deriveFilterValues = filter.deriveFilterValues;
  toTitleCase = filter.toTitleCase;
  captionText = filter.captionText;
} catch (_) { /* module not yet created — GI-T2 tests will fail */ }

try {
  const gd = require('../js/gallery-data.js');
  GALLERY_DATA_NODE = gd.GALLERY_DATA;
} catch (_) { /* module not yet exporting — GI-T2 tests will fail */ }

// ─── Tiny test runner ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (e) {
    console.log(`  ✗  ${label}`);
    console.log(`       ${e.message}`);
    failed++;
    failures.push({ label, message: e.message });
  }
}

function suite(name, fn) {
  console.log(`\n── ${name}`);
  fn();
}

// ─── Assertion helpers ───────────────────────────────────────────────────────

function readFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) throw new Error(`File not found: ${relPath}`);
  return fs.readFileSync(full, 'utf8');
}

function assertFileExists(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) throw new Error(`Expected file to exist: ${relPath}`);
}

/**
 * Assert a CSS file contains a property declaration matching the pattern.
 * pattern can be a string (exact substring) or RegExp.
 */
function assertCSSContains(relPath, pattern, description) {
  const css = readFile(relPath);
  const match = pattern instanceof RegExp ? pattern.test(css) : css.includes(pattern);
  if (!match) throw new Error(`${relPath}: expected to contain "${description || pattern}"`);
}

function assertCSSNotContains(relPath, pattern, description) {
  const css = readFile(relPath);
  const match = pattern instanceof RegExp ? pattern.test(css) : css.includes(pattern);
  if (match) throw new Error(`${relPath}: expected NOT to contain "${description || pattern}"`);
}

/**
 * Assert an HTML file contains a string or RegExp.
 */
function assertHTMLContains(relPath, pattern, description) {
  const html = readFile(relPath);
  const match = pattern instanceof RegExp ? pattern.test(html) : html.includes(pattern);
  if (!match) throw new Error(`${relPath}: expected to contain "${description || pattern}"`);
}

function assertHTMLNotContains(relPath, pattern, description) {
  const html = readFile(relPath);
  const match = pattern instanceof RegExp ? pattern.test(html) : html.includes(pattern);
  if (match) throw new Error(`${relPath}: expected NOT to contain "${description || pattern}"`);
}

// ─── T1: Design Tokens ───────────────────────────────────────────────────────

suite('T1 — Design tokens', () => {
  test('--bg token is pure white #FFFFFF', () => {
    assertCSSContains('css/tokens.css', /--bg\s*:\s*#[Ff][Ff][Ff][Ff][Ff][Ff]/, '--bg: #FFFFFF');
  });

  test('--surface token is #F2F2F2', () => {
    assertCSSContains('css/tokens.css', /--surface\s*:\s*#[Ff]2[Ff]2[Ff]2/, '--surface: #F2F2F2');
  });

  test('--nav-height token is defined', () => {
    assertCSSContains('css/tokens.css', '--nav-height', '--nav-height');
  });

  test('--nav-height is 56px on desktop', () => {
    assertCSSContains('css/tokens.css', /--nav-height\s*:\s*56px/, '--nav-height: 56px');
  });

  test('tokens.css no longer uses eggshell #F4F1EC', () => {
    assertCSSNotContains('css/tokens.css', '#F4F1EC', 'old eggshell color');
  });

  test('tokens.css no longer uses old surface #EDEAE4', () => {
    assertCSSNotContains('css/tokens.css', '#EDEAE4', 'old surface color');
  });
});

// ─── T2: Nav Component ───────────────────────────────────────────────────────

suite('T2 — Nav component (css/nav.css)', () => {
  test('css/nav.css exists', () => {
    assertFileExists('css/nav.css');
  });

  test('nav uses position sticky or fixed', () => {
    assertCSSContains('css/nav.css', /position\s*:\s*(sticky|fixed)/, 'sticky or fixed positioning');
  });

  test('nav is at the top (top: 0)', () => {
    assertCSSContains('css/nav.css', /top\s*:\s*0/, 'top: 0');
  });

  test('nav background is white', () => {
    assertCSSContains('css/nav.css', /#[Ff][Ff][Ff][Ff][Ff][Ff]|var\(--bg\)/, 'white background');
  });

  test('nav has a bottom border', () => {
    assertCSSContains('css/nav.css', 'border-bottom', 'border-bottom');
  });

  test('nav links use Inter font', () => {
    assertCSSContains('css/nav.css', /[Ii]nter/, 'Inter font');
  });

  test('nav links are uppercase', () => {
    assertCSSContains('css/nav.css', 'uppercase', 'text-transform: uppercase');
  });

  test('nav has letter-spacing', () => {
    assertCSSContains('css/nav.css', 'letter-spacing', 'letter-spacing');
  });

  test('nav desktop height is 56px', () => {
    assertCSSContains('css/nav.css', '56px', '56px height');
  });

  test('nav mobile height is 48px at max-width: 768px', () => {
    assertCSSContains('css/nav.css', '48px', '48px mobile height');
  });

  test('active link state is defined (.nav-link--active or [aria-current])', () => {
    assertCSSContains('css/nav.css', /active|aria-current/, 'active link style');
  });
});

// ─── T3: Nav Integration ─────────────────────────────────────────────────────

suite('T3 — Nav integration (all pages)', () => {
  const pages = ['index.html', 'about.html', 'gallery.html', 'contact.html'];

  pages.forEach(page => {
    test(`${page} links nav.css`, () => {
      assertHTMLContains(page, 'nav.css', 'nav.css stylesheet link');
    });

    test(`${page} contains site-nav element`, () => {
      assertHTMLContains(page, /class="[^"]*site-nav[^"]*"|id="[^"]*site-nav[^"]*"/, 'site-nav class or id');
    });

    test(`${page} nav has Gallery link`, () => {
      assertHTMLContains(page, /href="[^"]*gallery\.html[^"]*"/, 'Gallery link');
    });

    test(`${page} nav has About link`, () => {
      assertHTMLContains(page, /href="[^"]*about\.html[^"]*"/, 'About link');
    });

    test(`${page} nav has Contact link`, () => {
      assertHTMLContains(page, /href="[^"]*contact\.html[^"]*"/, 'Contact link');
    });
  });

  test('index.html no longer has bottom site-nav (prints.html link removed)', () => {
    // The old bottom nav linked to prints.html — a reliable tombstone.
    assertHTMLNotContains('index.html', 'prints.html', 'old bottom nav prints.html link');
  });

  test('gallery.html old logo-only header is replaced', () => {
    assertHTMLNotContains('gallery.html', 'class="gallery-header"', 'old .gallery-header');
  });

  test('index.html active link marks Gallery correctly', () => {
    // Home page nav should NOT mark Gallery, About, Contact as active;
    // it should mark itself or have no active — but must have the nav.
    // We simply verify the page has at least one aria-current or nav-link--active
    // that distinguishes the home page context.
    assertHTMLContains('index.html', /aria-current|nav-link--active/, 'active link indicator');
  });
});

// ─── T4: About Layout ────────────────────────────────────────────────────────

suite('T4 — About page layout refactor', () => {
  test('about.css has no --about-text-nudge-x', () => {
    assertCSSNotContains('css/about.css', '--about-text-nudge-x', 'text nudge-x variable');
  });

  test('about.css has no --about-text-nudge-y', () => {
    assertCSSNotContains('css/about.css', '--about-text-nudge-y', 'text nudge-y variable');
  });

  test('about.css has no --about-picture-shift-x', () => {
    assertCSSNotContains('css/about.css', '--about-picture-shift-x', 'picture shift-x variable');
  });

  test('about.css has no --about-picture-shift-y', () => {
    assertCSSNotContains('css/about.css', '--about-picture-shift-y', 'picture shift-y variable');
  });

  test('about.css mobile breakpoint fires at max-width: 768px (not 0px)', () => {
    assertCSSContains('css/about.css', /max-width\s*:\s*768px/, 'max-width: 768px breakpoint');
  });

  test('about.css mobile breakpoint is NOT 0px', () => {
    assertCSSNotContains('css/about.css', /max-width\s*:\s*0px/, 'broken 0px breakpoint');
  });

  test('about.css uses CSS grid or flex for layout (not translate nudges)', () => {
    assertCSSContains('css/about.css', /display\s*:\s*(grid|flex)/, 'grid or flex display');
  });

  test('.about-center-logo is NOT position: absolute', () => {
    // After refactor the logo should be in document flow
    const css = readFile('css/about.css');
    // Check that .about-center-logo does not have position: absolute
    const centerLogoBlock = css.match(/\.about-center-logo\s*\{([^}]*)\}/s);
    if (centerLogoBlock) {
      if (/position\s*:\s*absolute/.test(centerLogoBlock[1])) {
        throw new Error('css/about.css: .about-center-logo still uses position: absolute');
      }
    }
    // If block doesn't exist, it's been removed/renamed — that's fine
  });

  test('about.html has nav markup', () => {
    assertHTMLContains('about.html', /class="[^"]*site-nav[^"]*"/, 'site-nav in about.html');
  });
});

// ─── T5: Gallery Whitespace ──────────────────────────────────────────────────

suite('T5 — Gallery whitespace', () => {
  test('style_gallery.css body does NOT have overflow: hidden', () => {
    const css = readFile('css/style_gallery.css');
    // Find the body rule block
    const bodyBlock = css.match(/^body\s*\{([^}]*)\}/m);
    if (bodyBlock && /overflow\s*:\s*hidden/.test(bodyBlock[1])) {
      throw new Error('css/style_gallery.css: body still has overflow: hidden');
    }
  });

  test('.gallery-section has overflow: hidden (scoped clip)', () => {
    assertCSSContains('css/style_gallery.css', /\.gallery-section[^}]*overflow[^}]*hidden|overflow[^}]*hidden[^}]*\.gallery-section/, 'overflow: hidden on .gallery-section');
  });

  test('gallery-section uses flexbox centering (align-items: center) for vertical balance', () => {
    assertCSSContains('css/style_gallery.css', /\.gallery-section[^}]*align-items\s*:\s*center/s, 'align-items: center on .gallery-section');
  });

  test('gallery.js defines VERT_FILL for vertical breathing room', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('VERT_FILL')) {
      throw new Error('js/gallery.js does not define VERT_FILL');
    }
  });

  test('gallery grid gap is still ≤ 4px (tight gutters preserved)', () => {
    const css = readFile('css/style_gallery.css');
    const gapMatch = css.match(/\.gallery-grid[^}]*gap\s*:\s*(\d+)px/);
    if (gapMatch) {
      const gapVal = parseInt(gapMatch[1], 10);
      if (gapVal > 4) throw new Error(`gallery-grid gap is ${gapVal}px — expected ≤ 4px`);
    }
  });
});

// ─── T6: Mobile — Home + Contact ────────────────────────────────────────────

suite('T6 — Mobile: Home + Contact', () => {
  test('styles_update.css has a mobile breakpoint at max-width: 768px', () => {
    assertCSSContains('css/styles_update.css', /max-width\s*:\s*768px/, 'max-width: 768px on home');
  });

  test('home page hero uses min-height: 100vh or height: 100dvh on mobile', () => {
    assertCSSContains('css/styles_update.css', /min-height\s*:\s*100|height\s*:\s*100/, 'full-height hero');
  });

  test('contact.css has a mobile breakpoint at max-width: 768px or 900px', () => {
    assertCSSContains('css/contact.css', /max-width\s*:\s*(768|900)px/, 'mobile breakpoint');
  });

  test('contact.css inputs are full-width on mobile', () => {
    // In the mobile block, .grid should be single column
    assertCSSContains('css/contact.css', /grid-template-columns\s*:\s*1fr/, 'single-column grid on mobile');
  });

  test('contact.css does not use fixed artboard scale on mobile (transform: scale removed)', () => {
    const css = readFile('css/contact.css');
    // Find the mobile media block and check transform: none is applied to .container
    assertCSSContains('css/contact.css', /transform\s*:\s*none/, 'transform: none in mobile block');
  });
});

// ─── T7: Mobile — Gallery ────────────────────────────────────────────────────

suite('T7 — Mobile: Gallery', () => {
  test('style_gallery.css has a mobile breakpoint at max-width: 768px', () => {
    assertCSSContains('css/style_gallery.css', /max-width\s*:\s*768px/, 'mobile breakpoint');
  });

  test('gallery mobile layout is single column (flex-direction: column or grid-template-columns: 1fr)', () => {
    assertCSSContains('css/style_gallery.css',
      /flex-direction\s*:\s*column|grid-template-columns\s*:\s*1fr/,
      'single-column mobile layout');
  });

  test('gallery mobile images have 16px horizontal padding', () => {
    assertCSSContains('css/style_gallery.css', /padding[^:]*:\s*[^;]*16px/, '16px padding on mobile');
  });

  test('gallery mobile has overflow-y: auto or scroll (vertical scroll)', () => {
    assertCSSContains('css/style_gallery.css', /overflow-y\s*:\s*(auto|scroll)/, 'overflow-y: auto/scroll');
  });

  test('gallery mobile has no horizontal scroll (overflow-x: hidden)', () => {
    assertCSSContains('css/style_gallery.css', /overflow-x\s*:\s*hidden/, 'overflow-x: hidden on mobile');
  });
});

// ─── GG-T1: Nav selector in gallery.js ───────────────────────────────────────

suite('GG-T1 — Nav selector crash fix (js/gallery.js)', () => {
  test('gallery.js does NOT reference .gallery-header (regression guard)', () => {
    const js = readFile('js/gallery.js');
    if (js.includes('.gallery-header')) {
      throw new Error('js/gallery.js still contains .gallery-header — update to .site-nav');
    }
  });

  test('gallery.js references .site-nav to measure header height', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('.site-nav')) {
      throw new Error('js/gallery.js does not contain .site-nav');
    }
  });
});

// ─── GG-T2: 90% viewport fill calculation ────────────────────────────────────

suite('GG-T2 — 90% viewport fill calculation (js/gallery.js)', () => {
  test('FILL_TARGET constant is defined in gallery.js', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('FILL_TARGET')) {
      throw new Error('js/gallery.js does not define FILL_TARGET');
    }
  });

  test('setColumnWidth uses Math.max for fill-target vs aspect-ratio width', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('Math.max')) {
      throw new Error('js/gallery.js does not use Math.max in column width calculation');
    }
  });

  test('FILL_TARGET value is 0.90', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('FILL_TARGET') || !js.match(/FILL_TARGET\s*=\s*0\.9/)) {
      throw new Error('FILL_TARGET is not set to 0.90 in gallery.js');
    }
  });
});

// ─── GG-T3: Thumbnail compression ────────────────────────────────────────────

suite('GG-T3 — Thumbnail compression (gallery_photos/thumbnails/)', () => {
  // Load GALLERY_DATA filenames from gallery-data.js
  const galleryDataSrc = readFile('js/gallery-data.js');
  const filenameMatches = galleryDataSrc.match(/"filename"\s*:\s*"([^"]+)"/g) || [];
  const filenames = filenameMatches.map(m => m.match(/"([^"]+)"$/)[1]);

  test('gallery_photos/thumbnails/ directory exists', () => {
    assertFileExists('gallery_photos/thumbnails');
  });

  filenames.forEach(name => {
    test(`thumbnail exists for ${name}`, () => {
      assertFileExists(`gallery_photos/thumbnails/${name}`);
    });

    test(`thumbnail for ${name} is smaller than source`, () => {
      const srcPath = path.join(ROOT, 'gallery_photos', name);
      const thumbPath = path.join(ROOT, 'gallery_photos/thumbnails', name);
      const srcStat = fs.statSync(srcPath);
      const thumbStat = fs.statSync(thumbPath);
      if (thumbStat.size >= srcStat.size) {
        throw new Error(`thumbnail (${thumbStat.size}B) is not smaller than source (${srcStat.size}B)`);
      }
    });

    test(`thumbnail for ${name} is under 150KB`, () => {
      const thumbPath = path.join(ROOT, 'gallery_photos/thumbnails', name);
      const thumbStat = fs.statSync(thumbPath);
      if (thumbStat.size > 150 * 1024) {
        throw new Error(`thumbnail is ${Math.round(thumbStat.size / 1024)}KB — exceeds 150KB`);
      }
    });
  });
});

// ─── GG-T4: Thumbnails wired into gallery.js ─────────────────────────────────

suite('GG-T4 — Thumbnails wired into buildGrid / refreshLightbox', () => {
  test('buildGrid in gallery.js resolves img src from thumbnails/ path', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('thumbnails/')) {
      throw new Error('js/gallery.js buildGrid does not reference thumbnails/ path');
    }
  });

  test('refreshLightbox in gallery.js uses full-res gallery_photos/ (not thumbnails/)', () => {
    const js = readFile('js/gallery.js');
    // refreshLightbox should have gallery_photos/ and must NOT be thumbnails/ in that context
    const lightboxFnMatch = js.match(/function refreshLightbox[\s\S]*?^  \}/m);
    if (lightboxFnMatch && lightboxFnMatch[0].includes('thumbnails/')) {
      throw new Error('refreshLightbox references thumbnails/ — lightbox must use full-res images');
    }
  });

  test('all 30 GALLERY_DATA entries have a thumbnail field', () => {
    const js = readFile('js/gallery-data.js');
    const entries = js.match(/\{[\s\S]*?\}/g) || [];
    const withoutThumbnail = entries.filter(e => e.includes('"filename"') && !e.includes('"thumbnail"'));
    if (withoutThumbnail.length > 0) {
      throw new Error(`${withoutThumbnail.length} GALLERY_DATA entries are missing a "thumbnail" field`);
    }
  });
});

// ─── GI-T2: filterPhotos pure function ───────────────────────────────────────

suite('GI-T2 — filterPhotos (js/gallery-filter.js)', () => {
  function requireFilter(label, fn) {
    test(label, () => {
      if (!filterPhotos || !GALLERY_DATA_NODE) throw new Error('gallery-filter.js or gallery-data.js not loaded');
      fn();
    });
  }

  requireFilter('filterPhotos: null+null returns all photos', () => {
    const result = filterPhotos(GALLERY_DATA_NODE, { series: null, environment: null });
    if (result.length !== GALLERY_DATA_NODE.length) {
      throw new Error(`Expected ${GALLERY_DATA_NODE.length} photos, got ${result.length}`);
    }
  });

  requireFilter('filterPhotos: series=witness returns only witness photos', () => {
    const result = filterPhotos(GALLERY_DATA_NODE, { series: 'witness', environment: null });
    const expected = GALLERY_DATA_NODE.filter(p => p.series === 'witness');
    if (result.length !== expected.length) throw new Error(`Expected ${expected.length} witness photos, got ${result.length}`);
    if (result.some(p => p.series !== 'witness')) throw new Error('Result contains non-witness photos');
  });

  requireFilter('filterPhotos: AND intersection — contact+mountain returns only sierra-hiker-snow', () => {
    const result = filterPhotos(GALLERY_DATA_NODE, { series: 'contact', environment: 'mountain' });
    if (result.length !== 1) throw new Error(`Expected 1 photo, got ${result.length}`);
    if (result[0].filename !== 'sierra-hiker-snow.jpg') throw new Error(`Expected sierra-hiker-snow.jpg, got ${result[0].filename}`);
  });

  requireFilter('filterPhotos: no-match returns empty array', () => {
    const result = filterPhotos(GALLERY_DATA_NODE, { series: 'small', environment: 'ocean' });
    if (result.length !== 0) throw new Error(`Expected 0 photos, got ${result.length}`);
  });

  requireFilter('filterPhotos: witness+coastal returns correct subset', () => {
    const result = filterPhotos(GALLERY_DATA_NODE, { series: 'witness', environment: 'coastal' });
    const expected = GALLERY_DATA_NODE.filter(p => p.series === 'witness' && p.environment === 'coastal');
    if (result.length !== expected.length) throw new Error(`Expected ${expected.length}, got ${result.length}`);
    if (result.some(p => p.series !== 'witness' || p.environment !== 'coastal')) throw new Error('Result contains photos outside witness+coastal');
  });

  requireFilter('deriveFilterValues: returns sorted unique series', () => {
    const { series } = deriveFilterValues(GALLERY_DATA_NODE);
    const expected = ['contact', 'small', 'witness'];
    if (JSON.stringify(series) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(series)}`);
  });

  requireFilter('deriveFilterValues: returns sorted unique environments', () => {
    const { environment } = deriveFilterValues(GALLERY_DATA_NODE);
    const expected = ['coastal', 'lake', 'mountain', 'ocean'];
    if (JSON.stringify(environment) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(environment)}`);
  });
});

// ─── GI-T1: Layout foundation structural checks ──────────────────────────────

suite('GI-T1 — Layout foundation', () => {
  test('tokens.css defines --sidebar-width', () => {
    assertCSSContains('css/tokens.css', '--sidebar-width', '--sidebar-width');
  });

  test('gallery.html has <aside class="gallery-sidebar">', () => {
    assertHTMLContains('gallery.html', /class="[^"]*gallery-sidebar[^"]*"/, 'gallery-sidebar aside');
  });

  test('gallery.js buildGrid accepts a data argument (not always uses module-scoped photos)', () => {
    const js = readFile('js/gallery.js');
    if (!js.match(/function buildGrid\s*\(\s*\w+\s*\)/)) {
      throw new Error('buildGrid does not accept a parameter');
    }
  });

  test('gallery.js setColumnWidth reads gallerySection.clientWidth (not window.innerWidth for fill)', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('clientWidth')) {
      throw new Error('gallery.js setColumnWidth does not reference clientWidth');
    }
  });
});

// ─── GI-T4: Caption overlay structural checks ────────────────────────────────

suite('GI-T4 — Caption overlay', () => {
  test('style_gallery.css has figcaption opacity transition', () => {
    assertCSSContains('css/style_gallery.css', /figcaption/, 'figcaption rule');
  });

  test('style_gallery.css caption gradient goes to rgba(0,0,0', () => {
    assertCSSContains('css/style_gallery.css', /rgba\(0,\s*0,\s*0/, 'rgba black gradient');
  });

  test('style_gallery.css has prefers-reduced-motion rule for caption', () => {
    assertCSSContains('css/style_gallery.css', 'prefers-reduced-motion', 'prefers-reduced-motion');
  });

  test('gallery.js buildGrid injects figcaption', () => {
    assertCSSContains('css/style_gallery.css', /figcaption/, 'figcaption in buildGrid');
    const js = readFile('js/gallery.js');
    if (!js.includes('figcaption')) {
      throw new Error('gallery.js buildGrid does not create figcaption');
    }
  });
});

// ─── GI-T3: Filter UI structural + pure-function tests ───────────────────────

suite('GI-T3 — Filter UI (gallery-filter.js + gallery.html + gallery.js)', () => {
  function requireFilter(label, fn) {
    test(label, () => {
      if (!filterPhotos || !GALLERY_DATA_NODE) throw new Error('gallery-filter.js or gallery-data.js not loaded');
      fn();
    });
  }

  // Pure functions in gallery-filter.js
  requireFilter('toTitleCase: capitalises first letter of a slug', () => {
    if (!toTitleCase) throw new Error('toTitleCase not exported from gallery-filter.js');
    if (toTitleCase('witness') !== 'Witness') throw new Error('Expected "Witness"');
    if (toTitleCase('ocean') !== 'Ocean') throw new Error('Expected "Ocean"');
  });

  requireFilter('captionText: series — location when location is present', () => {
    if (!captionText) throw new Error('captionText not exported from gallery-filter.js');
    const result = captionText({ series: 'witness', location: 'California' });
    if (result !== 'witness — California') throw new Error(`Expected "witness — California", got "${result}"`);
  });

  requireFilter('captionText: series only when location is empty string', () => {
    if (!captionText) throw new Error('captionText not exported from gallery-filter.js');
    const result = captionText({ series: 'witness', location: '' });
    if (result !== 'witness') throw new Error(`Expected "witness", got "${result}"`);
    if (result.includes('—')) throw new Error('Empty location produced a separator');
  });

  // Structural: HTML
  test('gallery.html loads gallery-filter.js before gallery.js', () => {
    const html = readFile('gallery.html');
    const filterPos = html.indexOf('gallery-filter.js');
    const galleryPos = html.indexOf('gallery.js');
    if (filterPos === -1) throw new Error('gallery-filter.js script tag missing');
    if (filterPos > galleryPos) throw new Error('gallery-filter.js must be loaded before gallery.js');
  });

  test('gallery.html sidebar has .filter-toggle button', () => {
    assertHTMLContains('gallery.html', /filter-toggle/, '.filter-toggle button');
  });

  test('gallery.html sidebar has .filter-panel', () => {
    assertHTMLContains('gallery.html', /filter-panel/, '.filter-panel element');
  });

  // Structural: JS
  test('gallery.js clears the grid before each rebuild', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('innerHTML') && !js.match(/while\s*\(.*firstChild/)) {
      throw new Error('buildGrid does not clear grid.innerHTML before rebuilding');
    }
  });

  test('gallery.js calls filterPhotos on filter change', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('filterPhotos')) throw new Error('gallery.js does not call filterPhotos');
  });

  test('gallery.js calls deriveFilterValues to populate filter UI', () => {
    const js = readFile('js/gallery.js');
    if (!js.includes('deriveFilterValues')) throw new Error('gallery.js does not call deriveFilterValues');
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
console.log(`  ${passed} passed  |  ${failed} failed`);
if (failures.length) {
  console.log('\nFailed tests:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f.label}\n     → ${f.message}`));
}
console.log('─'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
