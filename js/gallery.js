/* ============================================================
   Sol Studio — Gallery
   1. Fetches gallery.json
   2. Builds grid items and injects them into the DOM
   3. Initialises Isotope masonry layout
   4. Wires up the filter bar
   5. Reads ?series= URL param to auto-filter on load
   ============================================================ */

(function () {

  var grid    = document.getElementById('gallery-grid');
  var filterBar = document.getElementById('filter-bar');
  var iso;   // Isotope instance — set up after images load

  /* ----------------------------------------------------------
     1. Fetch gallery.json and build the grid
     ---------------------------------------------------------- */
  fetch('./gallery.json')
    .then(function (res) { return res.json(); })
    .then(function (photos) {
      buildGrid(photos);
    })
    .catch(function (err) {
      console.error('Could not load gallery.json:', err);
    });

  /* ----------------------------------------------------------
     2. Build grid items from the photo data
     Each <figure> gets:
       - class "grid-item" + the series name (for Isotope filter)
       - data-series attribute (for future use)
     ---------------------------------------------------------- */
  function buildGrid(photos) {
    var fragment = document.createDocumentFragment();

    photos.forEach(function (photo) {
      var fig = document.createElement('figure');
      fig.className = 'grid-item ' + photo.series;  // e.g. "grid-item contact"
      fig.setAttribute('data-series', photo.series);

      var img = document.createElement('img');
      img.src     = 'gallery_photos/' + photo.filename;
      img.alt     = photo.alt || photo.title;
      img.loading = 'lazy';
      img.decoding = 'async';

      fig.appendChild(img);
      fragment.appendChild(fig);
    });

    grid.appendChild(fragment);

    // Wait for images to load before initialising Isotope
    // so it can measure heights correctly
    imagesLoaded(grid, function () {
      initIsotope();
    });
  }

  /* ----------------------------------------------------------
     3. Initialise Isotope masonry
     ---------------------------------------------------------- */
  function initIsotope() {
    // Fade items in now that they're measured
    var items = grid.querySelectorAll('.grid-item');
    items.forEach(function (el) { el.classList.add('loaded'); });

    iso = new Isotope(grid, {
      itemSelector:  '.grid-item',
      layoutMode:    'masonry',
      masonry: {
        columnWidth:  '.grid-sizer',
        gutter:       '.gutter-sizer'
      },
      // Sort: keep the original gallery.json order
      originLeft: true
    });

    // Apply ?series= URL param if present
    applyUrlFilter();
  }

  /* ----------------------------------------------------------
     4. Filter bar
     ---------------------------------------------------------- */
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn || !iso) return;

      // Update active state
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');

      // Filter the grid
      iso.arrange({ filter: btn.getAttribute('data-filter') });
    });
  }

  /* ----------------------------------------------------------
     5. URL param: ?series=contact
     Lets homepage links like "gallery.html?series=contact"
     auto-filter to that series on load.
     ---------------------------------------------------------- */
  function applyUrlFilter() {
    var params = new URLSearchParams(window.location.search);
    var series = params.get('series');
    if (!series || !iso) return;

    var filterValue = '.' + series;  // e.g. ".contact"
    var matchingBtn = filterBar
      ? filterBar.querySelector('[data-filter="' + filterValue + '"]')
      : null;

    if (matchingBtn) {
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('is-active');
      });
      matchingBtn.classList.add('is-active');
      iso.arrange({ filter: filterValue });
    }
  }

})();
