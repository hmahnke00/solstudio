/* ============================================================
   Sol Studio — Gallery
   Horizontal 3-row grid + lightbox.
   ============================================================ */

(function () {

  var grid           = document.getElementById('gallery-grid');
  var header         = document.querySelector('.site-nav');
  var gallerySection = document.getElementById('gallery-section');
  var filterPanel    = document.getElementById('filter-panel');
  var filterToggle   = document.querySelector('.filter-toggle');
  var lightbox       = document.getElementById('lightbox');
  var lightboxImg    = document.getElementById('lightbox-img');

  var photos       = [];
  var currentIndex = 0;
  var filterState  = { series: null, environment: null };
  var FILL_TARGET  = 0.90;
  var VERT_FILL    = 0.82;  // grid height fraction; remaining space split equally top/bottom

  /* ----------------------------------------------------------
     1. Load gallery data
     ---------------------------------------------------------- */
  if (typeof GALLERY_DATA !== 'undefined' && GALLERY_DATA.length) {
    photos = GALLERY_DATA;
    buildGrid(photos);
    setColumnWidth();
    if (typeof deriveFilterValues === 'function') {
      buildFilterUI(deriveFilterValues(photos));
    }
  } else {
    console.error('gallery-data.js not loaded or empty.');
  }

  /* ----------------------------------------------------------
     2. Build grid items
     ---------------------------------------------------------- */
  function buildGrid(data) {
    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();

    data.forEach(function (photo, index) {
      var fig = document.createElement('figure');
      fig.className = 'grid-item';

      var img = document.createElement('img');
      img.src      = 'gallery_photos/thumbnails/' + (photo.thumbnail || photo.filename);
      img.alt      = photo.alt || photo.title;
      img.loading  = 'lazy';
      img.decoding = 'async';

      var caption = document.createElement('figcaption');
      caption.textContent = typeof captionText === 'function'
        ? captionText(photo)
        : (photo.location ? photo.series + ' — ' + photo.location : photo.series);

      fig.appendChild(img);
      fig.appendChild(caption);
      fig.addEventListener('click', function () { openLightbox(index); });
      fragment.appendChild(fig);
    });

    grid.appendChild(fragment);
  }

  /* ----------------------------------------------------------
     3. Filter UI — builds fieldsets from derived values
     ---------------------------------------------------------- */
  function buildFilterUI(values) {
    if (!filterPanel) return;
    filterPanel.innerHTML = '';

    ['series', 'environment'].forEach(function (axis) {
      var fieldset = document.createElement('fieldset');
      fieldset.className = 'filter-fieldset';

      var legend = document.createElement('legend');
      legend.textContent = axis === 'series' ? 'Series' : 'Environment';
      fieldset.appendChild(legend);

      var allLabel = document.createElement('label');
      var allRadio = document.createElement('input');
      allRadio.type = 'radio';
      allRadio.name = axis;
      allRadio.value = '';
      allRadio.checked = true;
      allLabel.appendChild(allRadio);
      allLabel.appendChild(document.createTextNode(' All'));
      fieldset.appendChild(allLabel);

      values[axis].forEach(function (val) {
        var label = document.createElement('label');
        var radio = document.createElement('input');
        radio.type  = 'radio';
        radio.name  = axis;
        radio.value = val;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + (typeof toTitleCase === 'function' ? toTitleCase(val) : val)));
        fieldset.appendChild(label);
      });

      fieldset.addEventListener('change', function (e) {
        filterState[axis] = e.target.value || null;
        var filtered = typeof filterPhotos === 'function'
          ? filterPhotos(photos, filterState)
          : photos;
        buildGrid(filtered);
        setColumnWidth();
      });

      filterPanel.appendChild(fieldset);
    });
  }

  /* ----------------------------------------------------------
     4. Filter toggle (show/hide panel)
     ---------------------------------------------------------- */
  if (filterToggle) {
    filterToggle.addEventListener('click', function () {
      var expanded = filterToggle.getAttribute('aria-expanded') === 'true';
      filterToggle.setAttribute('aria-expanded', String(!expanded));
      filterPanel.classList.toggle('filter-panel--collapsed', expanded);
    });
  }

  /* ----------------------------------------------------------
     5. Scroll-aware collapse
     ---------------------------------------------------------- */
  var scrollDebounce;
  if (gallerySection) {
    gallerySection.addEventListener('scroll', function () {
      if (filterPanel) filterPanel.classList.add('filter-panel--collapsed');
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function () {
        if (filterPanel) filterPanel.classList.remove('filter-panel--collapsed');
      }, 600);
    });
  }

  var sidebar = document.querySelector('.gallery-sidebar');
  if (sidebar && filterPanel) {
    sidebar.addEventListener('mouseenter', function () {
      filterPanel.classList.remove('filter-panel--collapsed');
    });
  }

  /* ----------------------------------------------------------
     6. Set grid height + column width
     ---------------------------------------------------------- */
  function setColumnWidth() {
    var headerH   = header.offsetHeight;
    var available = window.innerHeight - headerH;
    var sectionH  = Math.floor(available * VERT_FILL);
    if (sectionH <= 0) {
      requestAnimationFrame(setColumnWidth);
      return;
    }
    var gap  = 2;
    var pad  = 2;
    var rows = 3;
    var rowH = (sectionH - 2 * pad - (rows - 1) * gap) / rows;
    var aspectRatioW = Math.floor((rowH * 3) / 2);
    var sectionW     = gallerySection ? gallerySection.clientWidth : window.innerWidth;
    var minFillW     = Math.floor((sectionW * FILL_TARGET) / rows);
    var colW = Math.max(aspectRatioW, minFillW);
    grid.style.height          = sectionH + 'px';
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
  function openLightbox(index) {
    currentIndex = index;
    refreshLightbox();
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
  }

  function refreshLightbox() {
    var photo = photos[currentIndex];
    lightboxImg.src = 'gallery_photos/' + photo.filename;
    lightboxImg.alt = photo.alt || photo.title;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    refreshLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % photos.length;
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
