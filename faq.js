(function () {
  const searchInput = document.getElementById('faqSearchInput');
  const noResults = document.getElementById('faqNoResults');
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  // ---------- Accordion open/close ----------
  document.querySelectorAll('.checklist-header').forEach((header) => {
    header.addEventListener('click', () => {
      const group = header.closest('.checklist-item-group');
      group.classList.toggle('open');
    });
  });

  // ---------- Live search ----------
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    faqItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const matches = !q || text.includes(q);
      item.hidden = !matches;
      if (matches) {
        visibleCount++;
        if (q) item.classList.add('open');
      }
    });

    document.querySelectorAll('.faq-category-title').forEach((title) => {
      let sibling = title.nextElementSibling;
      let hasVisible = false;
      while (sibling && sibling.classList.contains('faq-item')) {
        if (!sibling.hidden) hasVisible = true;
        sibling = sibling.nextElementSibling;
      }
      title.hidden = !hasVisible;
    });

    noResults.hidden = visibleCount !== 0;
  });
})();
