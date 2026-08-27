function snackSafe(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

function movementClass(value = '') {
  const text = String(value).toLowerCase();
  if (text.includes('up') || text.startsWith('+')) return 'up';
  if (text.includes('down') || text.startsWith('-')) return 'down';
  return '';
}

function rankingsMarkup(rankings = []) {
  if (!rankings.length) return '';
  return `
    <section class="snack-section">
      <h3>Power rankings</h3>
      <div class="rankings-table">
        <div class="rank-row head"><span>#</span><span>Team</span><span>Move</span><span>What I’m seeing</span></div>
        ${rankings.map(item => `
          <div class="rank-row">
            <span class="rank">${snackSafe(item.rank)}</span>
            <strong>${snackSafe(item.team)}</strong>
            <span class="move ${movementClass(item.movement)}">${snackSafe(item.movement || '—')}</span>
            <span>${snackSafe(item.note || '')}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function storyTableMarkup(table = {}) {
  const columns = Array.isArray(table.columns) ? table.columns : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  if (!columns.length || !rows.length) return '';
  const columnCount = Math.max(1, columns.length);
  return `
    <section class="snack-section story-table-section">
      <div class="story-table-scroll">
        <div class="story-table" style="--story-cols:${columnCount}">
          <div class="story-table-row head">${columns.map(column => `<span>${snackSafe(column)}</span>`).join('')}</div>
          ${rows.map(row => `<div class="story-table-row">${row.map((cell, index) => index === 1 ? `<strong>${snackSafe(cell)}</strong>` : `<span>${snackSafe(cell)}</span>`).join('')}</div>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function sectionsMarkup(sections = []) {
  return sections.map(section => `
    <section class="snack-section">
      <h3>${snackSafe(section.title)}</h3>
      ${(section.paragraphs || []).map(paragraph => `<p>${snackSafe(paragraph)}</p>`).join('')}
    </section>
  `).join('');
}

function debatesMarkup(items = []) {
  if (!items.length) return '';
  return `
    <section class="snack-debate-board">
      <h3>Spicy debate board</h3>
      <ul>${items.map(item => `<li>${snackSafe(item)}</li>`).join('')}</ul>
    </section>
  `;
}

function foodMarkup(food) {
  if (!food?.title && !food?.script) return '';
  return `
    <section class="food-segment">
      <span class="segment-label">FROM THE KITCHEN</span>
      <h3>${snackSafe(food.title || 'This week’s segment')}</h3>
      ${food.script ? `<blockquote>${snackSafe(food.script)}</blockquote>` : ''}
    </section>
  `;
}

function sourcesMarkup(sources = []) {
  if (!sources.length) return '';
  return `
    <section class="source-list">
      <strong>Receipts</strong>
      <p>${sources.map(source => `<a href="${snackSafe(source.url)}" target="_blank" rel="noopener noreferrer">${snackSafe(source.label || 'Source')}</a>`).join(' · ')}</p>
    </section>
  `;
}

function postMarkup(post) {
  return `
    <header class="snack-post-header ${post.type === 'feature' ? 'feature-header' : ''}">
      ${post.seriesLabel ? `<span class="snack-series-label">${snackSafe(post.seriesLabel)}</span>` : ''}
      <div class="meta"><span>${snackSafe(formatDate(post.published))}</span><span>•</span><span>${snackSafe(post.week || 'Weekly update')}</span></div>
      <h2>${snackSafe(post.title)}</h2>
      <p class="dek">${snackSafe(post.dek || '')}</p>
    </header>
    ${rankingsMarkup(post.rankings)}
    ${storyTableMarkup(post.storyTable)}
    ${sectionsMarkup(post.sections)}
    ${debatesMarkup(post.debates)}
    ${foodMarkup(post.foodSegment)}
    ${sourcesMarkup(post.sources)}
  `;
}

function featuredMarkup(posts, activeSlug) {
  return posts.map((post, index) => `
    <a class="snack-feature-card ${post.type === 'feature' ? 'feature' : 'byte'} ${post.slug === activeSlug ? 'active' : ''}" href="/snack-shak.html?post=${encodeURIComponent(post.slug)}#latest" ${post.slug === activeSlug ? 'aria-current="page"' : ''}>
      <span class="snack-feature-rank">${String(index + 1).padStart(2, '0')}</span>
      <div class="snack-feature-copy">
        <div class="snack-feature-meta">
          <em>${snackSafe(post.seriesLabel || (post.type === 'feature' ? 'FEATURE' : 'SNACK SHAK BYTE'))}</em>
          <span>${snackSafe(formatDate(post.published))}</span>
        </div>
        <strong>${snackSafe(post.title)}</strong>
        <p>${snackSafe(post.dek || '')}</p>
        <b>Read story →</b>
      </div>
    </a>
  `).join('');
}

function archiveMarkup(posts, activeSlug) {
  if (!posts.length) return '<div class="snack-archive-empty"><strong>The archive is caught up.</strong><p>Older stories will collect here as new plates are published.</p></div>';
  return posts.map(post => `
    <a class="archive-card ${post.type === 'feature' ? 'feature-card' : ''}" href="/snack-shak.html?post=${encodeURIComponent(post.slug)}#latest" ${post.slug === activeSlug ? 'aria-current="page"' : ''}>
      ${post.seriesLabel ? `<em>${snackSafe(post.seriesLabel)}</em>` : ''}
      <span>${snackSafe(formatDate(post.published))}</span>
      <strong>${snackSafe(post.title)}</strong>
      <p>${snackSafe(post.dek || '')}</p>
    </a>
  `).join('');
}

function sortPosts(posts = []) {
  return [...posts].sort((a, b) => {
    if (a.type === 'intro' && b.type !== 'intro') return 1;
    if (b.type === 'intro' && a.type !== 'intro') return -1;
    const date = String(b.published || '').localeCompare(String(a.published || ''));
    if (date) return date;
    return Number(b.priority || 0) - Number(a.priority || 0);
  });
}

async function fetchPostFile(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) return [];
  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload.posts) ? payload.posts : [];
}

async function loadSnackShaq() {
  const latest = document.getElementById('latestPost');
  const featured = document.getElementById('featuredGrid');
  const archive = document.getElementById('archiveGrid');
  try {
    const [specialResult, archiveResult] = await Promise.allSettled([
      fetchPostFile('/snack-shak-specials.json'),
      fetchPostFile('/snack-shaq-posts.json')
    ]);
    const specials = specialResult.status === 'fulfilled' ? specialResult.value : [];
    const weekly = archiveResult.status === 'fulfilled' ? archiveResult.value : [];
    const bySlug = new Map();
    [...weekly, ...specials].forEach(post => {
      if (post?.slug) bySlug.set(post.slug, post);
    });
    const posts = sortPosts([...bySlug.values()]);
    const stories = posts.filter(post => post.type !== 'intro');
    if (!stories.length) throw new Error('No Snack Shak stories have been published yet.');

    const requested = new URLSearchParams(location.search).get('post')?.replaceAll('snack-shaq', 'snack-shak');
    const active = stories.find(post => post.slug === requested) || stories[0];
    const featuredPosts = stories.slice(0, 4);
    const archivedPosts = stories.slice(4);

    latest.classList.remove('snack-loading');
    latest.innerHTML = postMarkup(active);
    featured.innerHTML = featuredMarkup(featuredPosts, active.slug);
    archive.innerHTML = archiveMarkup(archivedPosts, active.slug);
    document.title = `${active.title} | Snack Shak`;
  } catch (error) {
    latest.innerHTML = `<div class="error-box"><strong>Snack Shak could not load.</strong><span>${snackSafe(error.message)}</span></div>`;
    if (featured) featured.innerHTML = '';
    archive.innerHTML = '';
  }
}

loadSnackShaq();
