(function () {
  const form = document.getElementById('issueForm');
  const imageInput = document.getElementById('issueImage');
  const imagePreview = document.getElementById('issueImagePreview');
  const submitBtn = document.getElementById('issueSubmitBtn');
  const statusEl = document.getElementById('issueFormStatus');

  const publicContainer = document.getElementById('publicIssuesContainer');
  const publicEmpty = document.getElementById('publicIssuesEmpty');

  let pendingImageBase64 = null;

  const MAX_WIDTH = 800;
  const QUALITY = 0.65;

  // ---------- Image compress ----------
  if (imageInput) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (!file) return;
      resizeToBase64(file, MAX_WIDTH, QUALITY)
        .then((base64) => {
          pendingImageBase64 = base64;
          imagePreview.src = base64;
          imagePreview.hidden = false;
        })
        .catch((err) => {
          console.error(err);
          alert('Photo process नहीं हो पाई, दूसरी फोटो try करें।');
        });
    });
  }

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

  // ---------- Submit ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'भेजा जा रहा है…';
    hideStatus();

    const record = {
      name: document.getElementById('issueName').value.trim(),
      showNamePublicly: document.getElementById('issueShowName').checked,
      contact: document.getElementById('issueContact').value.trim(),
      location: document.getElementById('issueLocation').value.trim(),
      category: document.getElementById('issueCategory').value,
      description: document.getElementById('issueDescription').value.trim(),
      imageUrl: pendingImageBase64 || '',
      status: 'new',
      published: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('socialIssues').push(record)
      .then(() => {
        showStatus('success', 'धन्यवाद! आपकी बात दर्ज हो गई है। कार्यालय जल्द ही समीक्षा करेगा।');
        form.reset();
        imagePreview.hidden = true;
        pendingImageBase64 = null;
      })
      .catch((err) => {
        console.error(err);
        showStatus('error', 'भेजने में समस्या हुई। कृपया थोड़ी देर बाद फिर कोशिश करें, या सीधे कॉल करें।');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });

  function showStatus(type, msg) {
    statusEl.className = 'form-status ' + type;
    statusEl.textContent = msg;
    statusEl.hidden = false;
  }
  function hideStatus() { statusEl.hidden = true; }

  // ---------- Public listing (from curated publicSocialIssues node) ----------
  database.ref('publicSocialIssues').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
    items.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    renderPublicIssues(items);
  }, (err) => console.error('Could not load public issues:', err));

  function renderPublicIssues(items) {
    publicContainer.innerHTML = '';
    if (items.length === 0) {
      publicEmpty.hidden = false;
      return;
    }
    publicEmpty.hidden = true;

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card post-card';
      card.innerHTML = `
        ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.category || '')}" class="post-image" loading="lazy">` : ''}
        <div class="post-body">
          <span class="badge post-category">${escapeHtml(item.category || '')}</span>
          <h3 class="post-title">📍 ${escapeHtml(item.location || '')}</h3>
          <p class="post-excerpt">${escapeHtml(item.description || '')}</p>
          <p class="post-date">— ${escapeHtml(item.displayName || 'गुमनाम नागरिक')}</p>
        </div>
      `;
      publicContainer.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
