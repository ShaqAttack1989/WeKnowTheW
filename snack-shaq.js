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
    <header class="snack-post-header">
      <div class="meta"><span>${snackSafe(formatDate(post.published))}</span><span>•</span><span>${snackSafe(post.week || 'Weekly update')}</span></div>
      <h2>${snackSafe(post.title)}</h2>
      <p class="dek">${snackSafe(post.dek || '')}</p>
    </header>
    ${rankingsMarkup(post.rankings)}
    ${sectionsMarkup(post.sections)}
    ${debatesMarkup(post.debates)}
    ${foodMarkup(post.foodSegment)}
    ${sourcesMarkup(post.sources)}
  `;
}

function archiveMarkup(posts, activeSlug) {
  return posts.map(post => `
    <a class="archive-card" href="/snack-shaq.html?post=${encodeURIComponent(post.slug)}#latest" ${post.slug === activeSlug ? 'aria-current="page"' : ''}>
      <span>${snackSafe(formatDate(post.published))}</span>
      <strong>${snackSafe(post.title)}</strong>
      <p>${snackSafe(post.dek || '')}</p>
    </a>
  `).join('');
}

async function loadSnackShaq() {
  const latest = document.getElementById('latestPost');
  const archive = document.getElementById('archiveGrid');
  try {
    const response = await fetch('/snack-shaq-posts.json', { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    const posts = Array.isArray(payload.posts) ? payload.posts : [];
    if (!posts.length) throw new Error('No Snack Shaq posts have been published yet.');

    posts.sort((a, b) => {
      if (a.type === 'intro' && b.type !== 'intro') return 1;
      if (b.type === 'intro' && a.type !== 'intro') return -1;
      return String(b.published || '').localeCompare(String(a.published || ''));
    });
    const requested = new URLSearchParams(location.search).get('post');
    const active = posts.find(post => post.slug === requested) || posts[0];

    latest.classList.remove('snack-loading');
    latest.innerHTML = postMarkup(active);
    archive.innerHTML = archiveMarkup(posts, active.slug);
    document.title = `${active.title} | Snack Shaq`;
  } catch (error) {
    latest.innerHTML = `<div class="error-box"><strong>Snack Shaq could not load.</strong><span>${snackSafe(error.message)}</span></div>`;
    archive.innerHTML = '';
  }
}

loadSnackShaq();
