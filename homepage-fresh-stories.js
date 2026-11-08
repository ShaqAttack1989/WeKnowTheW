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
  function easternDay(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
    const part = type => parts.find(item => item.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  function calendarWeek(now = Date.now()) {
    const today = new Date(easternDay(now) + 'T12:00:00Z');
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - (today.getUTCDay() + 6) % 7);
    const end = new Date(start); end.setUTCDate(start.getUTCDate() + 7);
    const last = new Date(end); last.setUTCDate(end.getUTCDate() - 1);
    const label = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).formatRange(start, last);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), label };
  }
  function allocateStories(stories, now = Date.now()) {
    const chronological = [...stories].sort((a, b) => time(b.published) - time(a.published) || updated(b) - updated(a) || a.slug.localeCompare(b.slug));
    const newest = chronological.slice(0, 3), week = calendarWeek(now);
    const weekly = chronological.slice(3).filter(post => {
      const day = easternDay(post.published);
      return day >= week.start && day < week.end;
    });
    return { newest, weekly, week };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { selectStories, allocateStories, calendarWeek };
  if (!root.document) return;
  root.WHomeStories = { load: refresh, selectStories, allocateStories, calendarWeek };
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  const safeUrl = value => /^(\/[^/]|https:\/\/)/.test(String(value || '')) ? value : '';
  const href = post => safeUrl(post.dashboardUrl) || `/${post.type === 'feature' ? 'food-for-thought' : 'snack-shak-bytes'}.html?post=${encodeURIComponent(post.slug)}#story`;
  const date = post => new Date(updated(post)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  function card(post, index) {
    const isUSA3x3Guide = post.slug === 'usa-womens-3x3-americup-2026-watch-guide' || String(post.dashboardUrl || '').includes('usa-3x3-americup-2026') || /3x3 Watch Guide/i.test(post.title || '');
    const fallbackImage = isUSA3x3Guide ? 'https://storage.googleapis.com/usab-com-prod/upload/2026/08/18/aae2ef13-531c-4768-843d-935df11af515.jpeg' : '';
    const image = safeUrl(post.storyImage || post.image || post.imageUrl || post.photo || post.thumbnail) || fallbackImage;
    const imageAlt = post.imageAlt || (fallbackImage ? 'USA 3x3 women’s players huddle during 2026 Women’s Series play; Aerial Powers wears No. 10.' : post.title);
    const fit = post.imageFit === 'contain' ? 'contain' : 'cover';
    const focus = /^[\d.%\s]+$/.test(post.imageFocus || '') ? post.imageFocus : (fallbackImage ? '50% 42%' : '50% 35%');
    const eager = index === 0 || post.slug === 'usa-womens-3x3-americup-2026-watch-guide';
    return `<a class="season-story${index === 0 ? ' season-story-lead' : ''}" href="${safe(href(post))}" data-story-slug="${safe(post.slug)}">${image ? `<figure class="season-story-media"><img src="${safe(image)}" alt="${safe(imageAlt)}" loading="${eager ? 'eager' : 'lazy'}" fetchpriority="${eager ? 'high' : 'auto'}" decoding="async" style="object-fit:${fit};object-position:${focus}"><span>${safe(post.seriesLabel || 'SNACK SHAK')}</span></figure>` : ''}<div class="season-story-copy"><p class="season-story-label">${safe(date(post))}</p><h3>${safe(post.title)}</h3><p>${safe(post.dek || '')}</p><b>Read the story <span aria-hidden="true">→</span></b></div></a>`;
  }
  const snapshots = new Map();
  let pending = null;
  function render(stories) {
    const zones = [['#freshTopStories', 3]];
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
  function refresh(force = false) {
    if (pending) return pending;
    pending = Promise.allSettled(feeds.map(async url => {
      let payload;
      if (root.WHomeData?.get) payload = await root.WHomeData.get(url, { ttl: 300000, force });
      else {
        const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'default' });
        if (!response.ok) throw new Error('Article feed unavailable');
        payload = await response.json();
      }
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
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    refresh();
  };
  const firstZone = document.querySelector('#freshTopStories');
  if (firstZone && 'IntersectionObserver' in root) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      start();
    }, { rootMargin: '220px 0px', threshold: 0.01 });
    observer.observe(firstZone);
  } else if (firstZone) {
    if (root.requestIdleCallback) root.requestIdleCallback(start, { timeout: 1600 });
    else setTimeout(start, 900);
  }
  setInterval(() => { if (started && !document.hidden) refresh(); }, 300000);
  root.addEventListener('focus', () => { if (started) refresh(); });
  window.addEventListener('wktw:data-updated', event => {
    if (started && String(event.detail?.url || '').split('?')[0].match(/^\/snack-sha[kq]-/)) refresh();
  });
  document.addEventListener('visibilitychange', () => { if (started && !document.hidden) refresh(); });
})(typeof window !== 'undefined' ? window : globalThis);
