(function (root) {
  'use strict';
  const feeds = ['/snack-shak-love-and-basketball.json', '/snack-shak-all-time.json', '/snack-shaq-posts.json', '/snack-shak-specials.json', '/snack-shak-breaking.json', '/snack-shak-final.json', '/snack-shak-latest.json'];
  const time = value => { const n = Date.parse(value || ''); return Number.isFinite(n) ? n : 0; };
  const updated = post => Math.max(time(post.published), time(post.updated));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  function storyKeys(post) {
    const keys = ['slug:' + normalize(post.slug), 'title:' + normalize(post.title)];
    if (post.dashboardUrl) {
      try {
        const url = new URL(post.dashboardUrl, 'https://www.weknowthew.com');
        url.hash = '';
        [...url.searchParams.keys()].filter(key => key === 'cb' || key.startsWith('utm_')).forEach(key => url.searchParams.delete(key));
        url.searchParams.sort();
        keys.push('url:' + url.pathname + url.search);
      } catch { /* The slug and title still identify this story. */ }
    }
    return keys;
  }
  function selectStories(groups, now = Date.now()) {
    const eligible = groups.flat().filter(post => post && post.slug && post.title && post.published && time(post.published) && time(post.published) <= now && post.type !== 'intro' && !post.draft && !['draft', 'scheduled'].includes(post.status) && !post.homepageHidden);
    eligible.sort((a, b) => updated(b) - updated(a) || time(b.published) - time(a.published) || Number(b.priority || 0) - Number(a.priority || 0) || a.slug.localeCompare(b.slug));
    const seen = new Set();
    return eligible.filter(post => {
      const keys = storyKeys(post), duplicate = keys.some(key => seen.has(key));
      keys.forEach(key => seen.add(key));
      return !duplicate;
    });
  }
  // Allocate every article position together so lazy loading and refresh order
  // cannot put a featured story back into another homepage section.
  function allocateStories(stories) {
    const newest = stories.slice(0, 7), remaining = stories.slice(7);
    const isByte = post => post.type === 'byte' || /\bbyte\b/i.test(post.seriesLabel || '');
    const food = remaining.find(post => !isByte(post)) || null;
    const byte = remaining.find(post => isByte(post)) || null;
    const headlines = remaining.filter(post => post !== food && post !== byte).slice(0, 7);
    return { newest, food, byte, headlines };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { selectStories, allocateStories };
  if (!root.document) return;
  root.WHomeStories = { load: refresh, selectStories, allocateStories };
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
    })).then(() => {
      const plan = allocateStories(selectStories([...snapshots.values()]));
      render(plan.newest);
      root.dispatchEvent(new CustomEvent('wktw:homepage-stories', { detail: plan }));
      return plan;
    }).finally(() => { pending = null; });
    return pending;
  }
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 60000);
  root.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})(typeof window !== 'undefined' ? window : globalThis);
