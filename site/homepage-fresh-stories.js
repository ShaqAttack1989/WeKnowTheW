(function (root) {
  'use strict';
  const feeds = ['/snack-shak-love-and-basketball.json', '/snack-shak-all-time.json', '/snack-shaq-posts.json', '/snack-shak-specials.json', '/snack-shak-breaking.json', '/snack-shak-final.json', '/snack-shak-latest.json'];
  const time = value => { const n = Date.parse(value || ''); return Number.isFinite(n) ? n : 0; };
  const updated = post => Math.max(time(post.published), time(post.updated));
  function selectStories(groups, now = Date.now()) {
    const unique = new Map();
    groups.flat().forEach(post => {
      if (!post || !post.slug || !post.title || !post.published || !time(post.published) || time(post.published) > now || post.type === 'intro' || post.draft || post.status === 'draft' || post.status === 'scheduled' || post.homepageHidden) return;
      const previous = unique.get(post.slug);
      if (!previous || updated(post) >= updated(previous)) unique.set(post.slug, post);
    });
    return [...unique.values()].sort((a, b) => updated(b) - updated(a) || time(b.published) - time(a.published) || Number(b.priority || 0) - Number(a.priority || 0) || a.slug.localeCompare(b.slug));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { selectStories };
  if (!root.document) return;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  const safeUrl = value => /^(\/[^/]|https:\/\/)/.test(String(value || '')) ? value : '';
  const href = post => safeUrl(post.dashboardUrl) || `/${post.type === 'feature' ? 'food-for-thought' : 'snack-shak-bytes'}.html?post=${encodeURIComponent(post.slug)}#story`;
  const date = post => new Date(updated(post)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  function card(post, index) {
    const image = safeUrl(post.storyImage || post.image || post.imageUrl || post.photo || post.thumbnail);
    const fit = post.imageFit === 'contain' ? 'contain' : 'cover';
    const focus = /^[\d.%\s]+$/.test(post.imageFocus || '') ? post.imageFocus : '50% 35%';
    return `<a class="season-story${index === 0 ? ' season-story-lead' : ''}" href="${safe(href(post))}" data-story-slug="${safe(post.slug)}">${image ? `<figure class="season-story-media"><img src="${safe(image)}" alt="${safe(post.imageAlt || post.title)}" loading="${index === 0 ? 'eager' : 'lazy'}" style="object-fit:${fit};object-position:${focus}"><span>${safe(post.seriesLabel || 'SNACK SHAK')}</span></figure>` : ''}<div class="season-story-copy"><p class="season-story-label">${safe(date(post))}</p><h3>${safe(post.title)}</h3><p>${safe(post.dek || '')}</p><b>Read the story <span aria-hidden="true">→</span></b></div></a>`;
  }
  const snapshots = new Map();
  let pending = null;
  function render(stories) {
    if (!stories.length) return;
    const zones = [['#freshTopStories', 3], ['#freshNextStory', 1], ['#freshMoreStories', 3]];
    let cursor = 0;
    zones.forEach(([selector, count]) => {
      const host = document.querySelector(selector);
      if (!host) return;
      const chosen = stories.slice(cursor, cursor + count);
      cursor += chosen.length;
      const signature = JSON.stringify(chosen);
      if (host.dataset.storySignature === signature) return;
      host.dataset.storySignature = signature;
      host.innerHTML = chosen.map((post, index) => card(post, selector === '#freshTopStories' ? index : index + 1)).join('');
      host.hidden = !chosen.length;
    });
  }
  function refresh() {
    if (pending) return pending;
    pending = Promise.allSettled(feeds.map(async url => {
      const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Article feed unavailable');
      const payload = await response.json();
      if (!Array.isArray(payload.posts)) throw new Error('Invalid article feed');
      snapshots.set(url, payload.posts);
    })).then(() => render(selectStories([...snapshots.values()]))).finally(() => { pending = null; });
    return pending;
  }
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 60000);
  root.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})(typeof window !== 'undefined' ? window : globalThis);
