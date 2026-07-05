(function () {
  const container = document.getElementById('galleryContainer');
  const emptyEl = document.getElementById('galleryEmpty');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('galleryLightboxImg');
  const lightboxCaption = document.getElementById('galleryLightboxCaption');
  const lightboxClose = document.querySelector('.gallery-lightbox-close');

  if (!container || typeof database === 'undefined') return;

  database.ref('gallery').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    render(items);
  }, (err) => console.error('Could not load gallery:', err));

  function render(items) {
    container.innerHTML = '';
    if (items.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    items.forEach(item => {
      const cell = document.createElement('div');
      cell.className = 'gallery-cell';
      cell.innerHTML = `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.caption || 'Gallery photo')}" loading="lazy">`;
      cell.addEventListener('click', () => openLightbox(item));
      container.appendChild(cell);
    });
  }

  function openLightbox(item) {
    lightboxImg.src = item.imageUrl;
    lightboxCaption.textContent = item.caption || '';
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
