/* ============================================================
   Sol Studio — Prints
   Same horizontal 3-row grid + lightbox pattern as the gallery,
   filtered by print format/setting instead of series/environment.
   ============================================================ */

(function () {

  var grid           = document.getElementById('gallery-grid');
  var galleryNav     = document.getElementById('gallery-nav');
  var gallerySection = document.getElementById('gallery-section');
  var filterPanel    = document.getElementById('filter-panel');
  var filterToggle   = document.getElementById('filter-toggle');
  var filterAside    = document.getElementById('filter-aside');
  var lightbox       = document.getElementById('lightbox');
  var lightboxImg    = document.getElementById('lightbox-img');

  var photos       = [];
  var currentIndex = 0;
  var filterState  = { format: null, setting: null };

  /* ----------------------------------------------------------
     1. Load prints data
     ---------------------------------------------------------- */
  if (typeof PRINTS_DATA !== 'undefined' && PRINTS_DATA.length) {
    photos = PRINTS_DATA;
    buildGrid(photos);
    setColumnWidth();
    if (typeof deriveFilterValues === 'function') {
      buildFilterUI(deriveFilterValues(photos));
    }
  } else {
    console.error('prints-data.js not loaded or empty.');
  }

  /* ----------------------------------------------------------
     2. Build grid items
     ---------------------------------------------------------- */
  function buildGrid(data) {
    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();

    data.forEach(function (photo, index) {
      var fig = document.createElement('figure');
      fig.className = 'gx-tile';

      var img = document.createElement('img');
      img.src      = 'prints_photos/thumbnails/' + (photo.thumbnail || photo.filename);
      img.alt      = photo.alt || photo.title;
      img.loading  = 'lazy';
      img.decoding = 'async';

      var caption = document.createElement('figcaption');
      caption.className = 'gx-cap';
      caption.textContent = typeof captionText === 'function'
        ? captionText(photo)
        : photo.title;

      fig.appendChild(img);
      fig.appendChild(caption);
      fig.addEventListener('click', function () { openLightbox(index); });
      fragment.appendChild(fig);
    });

    grid.appendChild(fragment);
  }

  /* ----------------------------------------------------------
     3. Filter UI — button groups for Format and Setting
     ---------------------------------------------------------- */
  function buildFilterUI(values) {
    if (!filterPanel) return;
    filterPanel.innerHTML = '';

    var axes = [
      { key: 'format',  label: 'Format',  vals: values.format },
      { key: 'setting', label: 'Setting', vals: values.setting }
    ];

    axes.forEach(function (axis) {
      var group = document.createElement('div');
      group.className = 'filter-group';

      var heading = document.createElement('div');
      heading.className = 'filter-group-label';
      heading.textContent = axis.label;
      group.appendChild(heading);

      var list = document.createElement('div');
      list.className = 'filter-btn-list';

      axis.vals.forEach(function (val) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = typeof toTitleCase === 'function' ? toTitleCase(val) : val;
        btn.dataset.axis = axis.key;
        btn.dataset.val  = val;

        btn.addEventListener('click', function () {
          var isActive = filterState[axis.key] === val;
          filterState[axis.key] = isActive ? null : val;
          updateFilterButtons();
          var filtered = typeof filterPhotos === 'function'
            ? filterPhotos(photos, filterState)
            : photos;
          buildGrid(filtered);
          setColumnWidth();
        });

        list.appendChild(btn);
      });

      group.appendChild(list);
      filterPanel.appendChild(group);
    });
  }

  function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', filterState[btn.dataset.axis] === btn.dataset.val);
    });
  }

  /* ----------------------------------------------------------
     4. Filter sidebar toggle (bottom bar button)
     ---------------------------------------------------------- */
  if (filterToggle && filterAside) {
    filterToggle.addEventListener('click', function () {
      var hidden = filterAside.classList.toggle('is-hidden');
      filterToggle.textContent = hidden ? 'Show' : 'Hide';
      filterToggle.setAttribute('aria-expanded', String(!hidden));
      setColumnWidth();
    });
  }

  /* ----------------------------------------------------------
     5. Menu dropdown toggle
     ---------------------------------------------------------- */
  var menuBtn     = document.getElementById('menu-btn');
  var navDropdown = document.getElementById('nav-dropdown');

  if (menuBtn && navDropdown) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = !navDropdown.hidden;
      navDropdown.hidden = isOpen;
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', function () {
      navDropdown.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ----------------------------------------------------------
     6. Set grid height + column width
     ---------------------------------------------------------- */
  function setColumnWidth() {
    var navH      = galleryNav ? galleryNav.offsetHeight : 56;
    var bottomH   = 56;
    var available = window.innerHeight - navH - bottomH;
    if (available <= 0) {
      requestAnimationFrame(setColumnWidth);
      return;
    }
    var gap  = 2;
    var pad  = 2;
    var rows = 3;
    var rowH = (available - 2 * pad - (rows - 1) * gap) / rows;
    var colW = Math.floor((rowH * 3) / 2);
    grid.style.height          = available + 'px';
    grid.style.gridAutoColumns = colW + 'px';
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setColumnWidth, 100);
  });

  /* ----------------------------------------------------------
     7. Lightbox
     ---------------------------------------------------------- */
  var visiblePhotos = photos;

  function openLightbox(index) {
    currentIndex  = index;
    visiblePhotos = typeof filterPhotos === 'function'
      ? filterPhotos(photos, filterState)
      : photos;
    refreshLightbox();
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
  }

  function refreshLightbox() {
    var photo = visiblePhotos[currentIndex];
    if (!photo) return;
    lightboxImg.src = 'prints_photos/' + photo.filename;
    lightboxImg.alt = photo.alt || photo.title;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + visiblePhotos.length) % visiblePhotos.length;
    refreshLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % visiblePhotos.length;
    refreshLightbox();
  }

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', showPrev);
  document.getElementById('lightbox-next').addEventListener('click', showNext);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

})();
