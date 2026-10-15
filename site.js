(() => {
  'use strict';
  const allTriggers = [...document.querySelectorAll('[data-full]')];
  const cards = [...document.querySelectorAll('[data-category]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const dialog = document.getElementById('art-dialog');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  const count = document.getElementById('lightbox-count');
  const status = document.getElementById('lightbox-status');
  const close = document.getElementById('lightbox-close');
  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');
  let collection = [];
  let current = 0;
  let opener = null;

  function show(index) {
    if (!collection.length) return;
    current = (index + collection.length) % collection.length;
    const trigger = collection[current];
    status.textContent = 'Loading artwork…';
    image.alt = trigger.dataset.alt || trigger.querySelector('img').alt;
    image.src = trigger.dataset.full;
    caption.textContent = trigger.dataset.caption;
    count.textContent = `${current + 1} / ${collection.length}`;
    prev.disabled = next.disabled = collection.length < 2;
    if (image.complete && image.naturalWidth) status.textContent = '';
  }

  if (dialog && allTriggers.length) {
    image.addEventListener('load', () => { status.textContent = ''; });
    image.addEventListener('error', () => {
      if (dialog.open) status.textContent = 'This artwork could not load. Try the next piece or close the viewer.';
    });
    allTriggers.forEach(trigger => trigger.addEventListener('click', () => {
      collection = allTriggers.filter(item => !item.closest('[data-category]')?.hidden);
      opener = trigger;
      show(collection.indexOf(trigger));
      dialog.showModal();
      document.body.classList.add('viewer-open');
      close.focus();
    }));
    close.addEventListener('click', () => dialog.close());
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
      if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('viewer-open');
      image.removeAttribute('src');
      status.textContent = '';
      opener?.focus();
    });
  }

  filters.forEach(filter => filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === filter)));
    let visible = 0;
    cards.forEach(card => {
      card.hidden = category !== 'All' && card.dataset.category !== category;
      if (!card.hidden) visible += 1;
    });
    document.getElementById('gallery-count').textContent = `${visible} ${visible === 1 ? 'work' : 'works'}`;
  }));
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
