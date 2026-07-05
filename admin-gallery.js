// ============================================================
// ADMIN — GALLERY MANAGEMENT (No Firebase Storage needed)
// Firebase Realtime Database: gallery/{itemId}
// Images resized + compressed in browser, stored as base64.
// ============================================================
(function () {
  const galleryRef = database.ref('gallery');

  const form = document.getElementById('galleryForm');
  const imageInput = document.getElementById('galleryImage');
  const imagePreview = document.getElementById('galleryImagePreview');
  const captionInput = document.getElementById('galleryCaption');
  const submitBtn = document.getElementById('gallerySubmitBtn');
  const statusEl = document.getElementById('galleryFormStatus');

  const listEl = document.getElementById('adminGalleryList');
  const emptyEl = document.getElementById('galleryEmptyState');

  let pendingBase64 = null;
  let allItems = [];

  const MAX_WIDTH = 800;
  const QUALITY = 0.68;

  galleryRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    allItems = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
    allItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    render();
  }, (err) => console.error('Could not load gallery:', err));

  function render() {
    listEl.innerHTML = '';
    if (allItems.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    allItems.forEach(item => {
      const cell = document.createElement('div');
      cell.className = 'admin-gallery-cell';
      cell.innerHTML = `
        <img src="${item.imageUrl}" alt="${escapeHtml(item.caption || '')}">
        <button class="icon-btn delete gallery-delete-btn" data-id="${item.id}" title="Delete">🗑</button>
        ${item.caption ? `<p class="admin-gallery-caption">${escapeHtml(item.caption)}</p>` : ''}
      `;
      listEl.appendChild(cell);
    });

    listEl.querySelectorAll('.gallery-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('यह फोटो हटाना है?')) return;
        galleryRef.child(btn.dataset.id).remove()
          .catch(err => alert('Could not delete: ' + err.message));
      });
    });
  }

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    resizeToBase64(file, MAX_WIDTH, QUALITY)
      .then(base64 => {
        pendingBase64 = base64;
        imagePreview.src = base64;
        imagePreview.hidden = false;
      })
      .catch(err => {
        console.error(err);
        alert('Photo process नहीं हो पाई, दूसरी फोटो try करें।');
      });
  });

  function resizeToBase64(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!pendingBase64) {
      showStatus('error', 'कृपया पहले एक फोटो चुनें।');
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading…';
    hideStatus();

    try {
      await galleryRef.push({
        imageUrl: pendingBase64,
        caption: captionInput.value.trim(),
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
      showStatus('success', 'फोटो Gallery में जुड़ गई!');
      form.reset();
      imagePreview.hidden = true;
      pendingBase64 = null;
    } catch (err) {
      console.error(err);
      showStatus('error', 'Could not upload: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '📤 Upload करें';
    }
  });

  function showStatus(type, msg) {
    statusEl.className = 'form-status ' + type;
    statusEl.textContent = msg;
    statusEl.hidden = false;
  }
  function hideStatus() { statusEl.hidden = true; }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
