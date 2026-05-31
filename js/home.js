/* ============================================================
   Sol Studio — Homepage interactions
   1. Sticky nav: appears when the hero panel scrolls out of view
   2. Scroll reveal: panel content fades in as you scroll to it
   ============================================================ */

(function () {

  /* ----------------------------------------------------------
     1. Sticky nav
     Uses IntersectionObserver to watch the hero panel.
     When the hero is no longer visible, show the sticky nav.
     ---------------------------------------------------------- */
  const hero      = document.getElementById('hero');
  const stickyNav = document.getElementById('sticky-nav');

  if (hero && stickyNav) {
    const navObserver = new IntersectionObserver(
      function (entries) {
        // entries[0].isIntersecting is true while hero is on screen
        const heroVisible = entries[0].isIntersecting;
        stickyNav.classList.toggle('visible', !heroVisible);
      },
      {
        // Fire when less than 5% of the hero is still visible
        threshold: 0.05
      }
    );
    navObserver.observe(hero);
  }

  /* ----------------------------------------------------------
     2. Scroll reveal
     Any element with class "reveal" fades in when it enters
     the viewport. The observer stops watching after it fires
     so the animation only plays once.
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // play once, then stop watching
          }
        });
      },
      {
        // Start the animation when 15% of the element is in view
        threshold: 0.15
      }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

})();
