(function () {
  'use strict';
  const imageUrl = 'https://storage.googleapis.com/usab-com-prod/upload/2026/08/18/aae2ef13-531c-4768-843d-935df11af515.jpeg';
  const imageAlt = 'USA 3x3 women’s players huddle during 2026 Women’s Series play; Aerial Powers wears No. 10.';
  const host = document.querySelector('#freshTopStories');
  if (!host) return;

  function ensurePhoto() {
    host.querySelectorAll('a.season-story').forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const href = card.getAttribute('href') || '';
      const isTarget = href.includes('usa-3x3-americup-2026.html')
        || card.dataset.storySlug === 'usa-womens-3x3-americup-2026-watch-guide'
        || /3x3 Watch Guide/i.test(title);
      if (!isTarget || card.querySelector('.season-story-media img')) return;

      const media = document.createElement('figure');
      media.className = 'season-story-media';
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = imageAlt;
      image.loading = 'eager';
      image.fetchPriority = 'high';
      image.decoding = 'async';
      image.style.objectFit = 'cover';
      image.style.objectPosition = '50% 42%';
      const label = document.createElement('span');
      label.textContent = 'NO OFFSEASON · 3X3 AMERICUP';
      media.append(image, label);
      card.insertBefore(media, card.firstChild);
    });
  }

  const observer = new MutationObserver(ensurePhoto);
  observer.observe(host, { childList: true, subtree: true });
  ensurePhoto();
})();
