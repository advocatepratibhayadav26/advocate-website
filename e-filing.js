(function () {
  document.querySelectorAll('.checklist-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.checklist-item-group').classList.toggle('open');
    });
  });
})();
