/* ============================================================
   Sol Studio — Theme Toggle
   Switches between light and dark mode by setting
   data-theme="light" or data-theme="dark" on <html>.
   Preference is saved to localStorage so it persists
   across page loads and sessions.
   ============================================================ */

(function () {

  // --- 1. Read the saved preference, or fall back to OS setting ---
  function getPreference() {
    const saved = localStorage.getItem('sol-theme');
    if (saved) return saved;                          // user has chosen before
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';            // first visit: honour OS
  }

  // --- 2. Apply a theme by setting the attribute on <html> ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // --- 3. Update the button label to show the *opposite* state ---
  function updateButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.textContent = theme === 'dark' ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // --- 4. Toggle between themes on click ---
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('sol-theme', next);
    updateButton(next);
  }

  // --- 5. Init: apply saved theme before page paints to avoid flash ---
  const initialTheme = getPreference();
  applyTheme(initialTheme);

  // --- 6. Wire up the button once the DOM is ready ---
  document.addEventListener('DOMContentLoaded', function () {
    updateButton(initialTheme);

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });

})();
