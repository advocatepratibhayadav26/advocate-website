(function () {
  const STORAGE_KEY = 'pyadav_checklist_state';

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors (e.g. private browsing)
    }
  }

  let state = loadState();

  // ---------- Turn each <li> into a checkable row ----------
  document.querySelectorAll('.checklist-list li').forEach((li) => {
    const id = li.dataset.id;
    const text = li.textContent;
    li.innerHTML = `<label><input type="checkbox" data-id="${id}"> <span>${text}</span></label>`;
    const checkbox = li.querySelector('input');
    checkbox.checked = !!state[id];
    if (checkbox.checked) li.classList.add('checked');

    checkbox.addEventListener('change', () => {
      state[id] = checkbox.checked;
      li.classList.toggle('checked', checkbox.checked);
      saveState(state);
    });
  });

  // ---------- Accordion open/close ----------
  document.querySelectorAll('.checklist-header').forEach((header) => {
    header.addEventListener('click', () => {
      const group = header.closest('.checklist-item-group');
      group.classList.toggle('open');
    });
  });

  // Open the first group by default
  const firstGroup = document.querySelector('.checklist-item-group');
  if (firstGroup) firstGroup.classList.add('open');

  // ---------- Print a single checklist group ----------
  document.querySelectorAll('.checklist-print-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const groupKey = btn.dataset.group;
      const list = document.querySelector(`.checklist-list[data-group="${groupKey}"]`);
      const title = btn.closest('.checklist-item-group').querySelector('.checklist-header span').textContent;

      const lines = [title, ''];
      list.querySelectorAll('li').forEach((li) => {
        const checked = li.querySelector('input').checked ? '[x]' : '[ ]';
        lines.push(checked + ' ' + li.querySelector('span').textContent);
      });

      document.getElementById('printArea').textContent = lines.join('\n');
      window.print();
    });
  });
})();
