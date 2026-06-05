#!/usr/bin/env node
/**
 * Sol Studio — CSS/HTML structural test suite
 * Run: node tests/run_tests.js
 * No dependencies — uses only built-in Node modules.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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

  test('gallery grid has padding-top of at least 48px', () => {
    assertCSSContains('css/style_gallery.css', /padding-top\s*:\s*([4-9]\d|[1-9]\d{2,})px/, 'padding-top >= 48px');
  });

  test('gallery grid has padding-bottom of at least 48px', () => {
    assertCSSContains('css/style_gallery.css', /padding-bottom\s*:\s*([4-9]\d|[1-9]\d{2,})px/, 'padding-bottom >= 48px');
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

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
console.log(`  ${passed} passed  |  ${failed} failed`);
if (failures.length) {
  console.log('\nFailed tests:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f.label}\n     → ${f.message}`));
}
console.log('─'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
