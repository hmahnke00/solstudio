/* ============================================================
   Sol Studio — Gallery
   Horizontal 3-row grid + lightbox.
   ============================================================ */

(function () {

  var grid        = document.getElementById('gallery-grid');
  var section     = document.querySelector('.gallery-section');
  var header      = document.querySelector('.gallery-header');
  var lightbox    = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  var photos       = [];
  var currentIndex = 0;

  /* ----------------------------------------------------------
     1. Load gallery data (inlined via gallery-data.js to support
        file:// protocol — fetch() is blocked on local files)
     ---------------------------------------------------------- */
  if (typeof GALLERY_DATA !== 'undefined' && GALLERY_DATA.length) {
    photos = GALLERY_DATA;
    buildGrid(photos);
    setColumnWidth();
  } else {
    console.error('gallery-data.js not loaded or empty.');
  }

  /* ----------------------------------------------------------
     2. Build grid items
     ---------------------------------------------------------- */
  function buildGrid(data) {
    var fragment = document.createDocumentFragment();

    data.forEach(function (photo, index) {
      var fig = document.createElement('figure');
      fig.className = 'grid-item';

      var img = document.createElement('img');
      img.src      = 'gallery_photos/' + photo.filename;
      img.alt      = photo.alt || photo.title;
      img.loading  = 'lazy';
      img.decoding = 'async';

      fig.appendChild(img);
      fig.addEventListener('click', function () { openLightbox(index); });
      fragment.appendChild(fig);
    });

    grid.appendChild(fragment);
  }

  /* ----------------------------------------------------------
     3. Set grid height + column width so cells are 4:3 rectangles.
        Recalculates on resize.
     ---------------------------------------------------------- */
  function setColumnWidth() {
    var headerH  = header.offsetHeight;
    var sectionH = window.innerHeight - headerH;
    if (sectionH <= 0) {
      requestAnimationFrame(setColumnWidth);
      return;
    }
    var gap  = 2;
    var pad  = 2;
    var rows = 3;
    var rowH = (sectionH - 2 * pad - (rows - 1) * gap) / rows;
    var colW = Math.floor((rowH * 16) / 9);
    grid.style.height          = sectionH + 'px';
    grid.style.gridAutoColumns = colW + 'px';
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setColumnWidth, 100);
  });

  /* ----------------------------------------------------------
     4. Lightbox
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
