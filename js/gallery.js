/* ============================================================
   Sol Studio — Gallery
   1. Fetches gallery.json and builds the grid
   2. Simple show/hide filtering with fade transition
   3. Reads ?series= URL param to auto-filter on load
   ============================================================ */

(function () {

  var grid      = document.getElementById('gallery-grid');
  var filterBar = document.getElementById('filter-bar');

  /* ----------------------------------------------------------
     1. Fetch gallery.json and build the grid
     ---------------------------------------------------------- */
  fetch('./gallery.json')
    .then(function (res) { return res.json(); })
    .then(function (photos) {
      buildGrid(photos);
      applyUrlFilter();
    })
    .catch(function (err) {
      console.error('Could not load gallery.json:', err);
    });

  /* ----------------------------------------------------------
     2. Build grid items from photo data
     ---------------------------------------------------------- */
  function buildGrid(photos) {
    var fragment = document.createDocumentFragment();

    photos.forEach(function (photo) {
      var fig = document.createElement('figure');
      fig.className = 'grid-item ' + photo.series;
      fig.setAttribute('data-series', photo.series);

      var img = document.createElement('img');
      img.src      = 'gallery_photos/' + photo.filename;
      img.alt      = photo.alt || photo.title;
      img.loading  = 'lazy';
      img.decoding = 'async';

      fig.appendChild(img);
      fragment.appendChild(fig);
    });

    grid.appendChild(fragment);
  }

  /* ----------------------------------------------------------
     3. Filter bar — show/hide with CSS transition
     ---------------------------------------------------------- */
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;

      // Update active state
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');

      var filter = btn.getAttribute('data-filter'); // "*" or ".contact" etc.

      grid.querySelectorAll('.grid-item').forEach(function (item) {
        var show = filter === '*' || item.classList.contains(filter.slice(1));
        item.classList.toggle('hidden', !show);
      });
    });
  }

  /* ----------------------------------------------------------
     4. URL param: ?series=contact
     ---------------------------------------------------------- */
  function applyUrlFilter() {
    var params = new URLSearchParams(window.location.search);
    var series = params.get('series');
    if (!series) return;

    var btn = filterBar
      ? filterBar.querySelector('[data-filter=".' + series + '"]')
      : null;

    if (btn) btn.click();
  }

})();
