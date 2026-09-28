(() => {
  const triggers = [...document.querySelectorAll('[data-full]')];
  const dialog = document.getElementById('art-dialog');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  const count = document.getElementById('lightbox-count');
  let current = 0;
  let opener = null;

  function show(index) {
    current = (index + triggers.length) % triggers.length;
    const trigger = triggers[current];
    image.src = trigger.dataset.full;
    image.alt = trigger.querySelector('img').alt;
    caption.textContent = trigger.dataset.caption;
    count.textContent = `${current + 1} / ${triggers.length}`;
  }

  triggers.forEach((trigger, index) => trigger.addEventListener('click', () => {
    opener = trigger;
    show(index);
    dialog.showModal();
    document.getElementById('lightbox-close').focus();
  }));
  document.getElementById('lightbox-close').addEventListener('click', () => dialog.close());
  document.getElementById('lightbox-prev').addEventListener('click', () => show(current - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus(); });
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
