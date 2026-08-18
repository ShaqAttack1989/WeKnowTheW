const mediaLibrary = require('../media-library.json');

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function metaValue(meta, key) {
  return meta?.[key]?.value ? stripHtml(meta[key].value) : '';
}

function licenseIsReusable(license = '') {
  const value = String(license).trim().toUpperCase();
  return value.startsWith('CC BY-SA ')
    || value.startsWith('CC BY ')
    || value.startsWith('CC0')
    || value.includes('PUBLIC DOMAIN')
    || value === 'PDM';
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WeKnowTheW/1.2 (independent basketball encyclopedia; reusable-media resolver)'
    }
  });
  if (!response.ok) throw new Error(`Wikimedia returned ${response.status}`);
  return response.json();
}

function manualMedia(type, subject) {
  const wantedType = normalize(type);
  const wantedSubject = normalize(subject);
  return (mediaLibrary.items || []).find(item =>
    normalize(item.type) === wantedType && normalize(item.subject) === wantedSubject
  ) || null;
}

function pageTitleScore(title, name) {
  const page = normalize(title);
  const target = normalize(name);
  if (page === target) return 100;
  if (page.startsWith(`${target} `)) return 90;
  if (page.includes(target)) return 75;
  const tokens = target.split(' ').filter(Boolean);
  return tokens.reduce((score, token) => score + (page.includes(token) ? 12 : 0), 0);
}

function latestYear(value = '') {
  const years = [...String(value).matchAll(/\b(20\d{2})\b/g)]
    .map(match => Number(match[1]))
    .filter(year => year >= 2000 && year <= new Date().getUTCFullYear() + 1);
  return years.length ? Math.max(...years) : 0;
}

function freshnessScore(item, name) {
  const title = normalize(item.fileTitle || '');
  const description = normalize(item.caption || '');
  const target = normalize(name);
  let score = 0;

  if (title.includes(target)) score += 25;
  if (title.includes('cropped') || title.includes('crop')) score += 8;
  if (title.includes('portrait') || description.includes('portrait')) score += 6;
  if (title.includes('team photo') || description.includes('team photo')) score -= 8;

  const describedYear = latestYear(`${item.fileTitle || ''} ${item.caption || ''}`);
  const uploadedYear = item.uploadedAt ? new Date(item.uploadedAt).getUTCFullYear() : 0;
  const year = describedYear || uploadedYear;
  if (year >= 2026) score += 42;
  else if (year === 2025) score += 34;
  else if (year === 2024) score += 26;
  else if (year === 2023) score += 18;
  else if (year === 2022) score += 9;
  else if (year && year < 2020) score -= 8;

  return score;
}

async function wikipediaPlayerPage(name) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `"${name}" basketball`,
    gsrnamespace: '0',
    gsrlimit: '8',
    prop: 'pageimages|pageprops',
    piprop: 'name',
    ppprop: 'wikibase_item',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const body = await fetchJson(`${WIKIPEDIA_API}?${params}`);
  const pages = body?.query?.pages || [];
  return pages
    .map(page => ({ ...page, score: pageTitleScore(page.title, name) }))
    .filter(page => page.score >= 20)
    .sort((a, b) => b.score - a.score)[0] || null;
}

function commonsRecord(page, name, source = 'commons-search', requireNameMatch = false) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  const license = metaValue(meta, 'LicenseShortName') || metaValue(meta, 'UsageTerms');
  if (!licenseIsReusable(license)) return null;

  const mime = String(info.mime || '').toLowerCase();
  if (mime && !['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return null;

  const description = metaValue(meta, 'ImageDescription');
  const titleText = String(page.title || '').replace(/^File:/i, '');
  if (requireNameMatch) {
    const targetTokens = normalize(name).split(' ').filter(Boolean);
    const haystack = normalize(`${titleText} ${description}`);
    const tokenHits = targetTokens.filter(token => haystack.includes(token)).length;
    if (tokenHits < Math.max(1, targetTokens.length - 1)) return null;
  }

  const creator = metaValue(meta, 'Artist') || metaValue(meta, 'Credit') || 'Wikimedia Commons contributor';
  const licenseUrl = metaValue(meta, 'LicenseUrl');
  const sourceUrl = info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || '')}`;

  return {
    type: 'player',
    subject: name,
    image: info.thumburl || info.url,
    originalImage: info.url,
    alt: `${name} basketball player`,
    caption: description || `${name}.`,
    creator,
    sourceUrl,
    license,
    licenseUrl,
    source: 'Wikimedia Commons',
    fileTitle: page.title || '',
    uploadedAt: info.timestamp || '',
    resolvedBy: source
  };
}

async function commonsFileByTitle(fileName, name, source = 'commons-file') {
  if (!fileName) return null;
  const title = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|mime|timestamp|extmetadata',
    iiurlwidth: '720',
    iiextmetadatafilter: 'Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|ImageDescription',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const body = await fetchJson(`${COMMONS_API}?${params}`);
  const page = body?.query?.pages?.[0];
  if (!page || page.missing) return null;
  return commonsRecord(page, name, source, false);
}

async function wikidataImage(wikibaseItem, name) {
  if (!wikibaseItem) return null;
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids: wikibaseItem,
    props: 'claims',
    format: 'json',
    origin: '*'
  });
  const body = await fetchJson(`${WIKIDATA_API}?${params}`);
  const entity = body?.entities?.[wikibaseItem];
  const claims = entity?.claims?.P18 || [];
  for (const claim of claims) {
    const fileName = claim?.mainsnak?.datavalue?.value;
    if (!fileName) continue;
    const record = await commonsFileByTitle(fileName, name, 'wikidata-p18');
    if (record) return record;
  }
  return null;
}

async function commonsCategory(name) {
  const categoryParams = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${name}`,
    cmnamespace: '6',
    cmlimit: '40',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const categoryBody = await fetchJson(`${COMMONS_API}?${categoryParams}`);
  const members = categoryBody?.query?.categorymembers || [];
  if (!members.length) return null;

  const titles = members.map(member => member.title).join('|');
  const params = new URLSearchParams({
    action: 'query',
    titles,
    prop: 'imageinfo',
    iiprop: 'url|mime|timestamp|extmetadata',
    iiurlwidth: '720',
    iiextmetadatafilter: 'Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|ImageDescription',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const body = await fetchJson(`${COMMONS_API}?${params}`);
  const records = (body?.query?.pages || [])
    .map(page => commonsRecord(page, name, 'commons-category', false))
    .filter(Boolean)
    .sort((a, b) => freshnessScore(b, name) - freshnessScore(a, name));
  return records[0] || null;
}

async function commonsSearch(name) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${name} basketball`,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|mime|timestamp|extmetadata',
    iiurlwidth: '720',
    iiextmetadatafilter: 'Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|ImageDescription',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const body = await fetchJson(`${COMMONS_API}?${params}`);
  const records = (body?.query?.pages || [])
    .map(page => commonsRecord(page, name, 'commons-search', true))
    .filter(Boolean)
    .sort((a, b) => freshnessScore(b, name) - freshnessScore(a, name));
  return records[0] || null;
}

async function resolvePlayerMedia(name) {
  const manual = manualMedia('player', name);
  if (manual) return { ...manual, resolvedBy: 'manual-library' };

  try {
    const record = await commonsCategory(name);
    if (record) return record;
  } catch {
    // Continue to broader fallbacks.
  }

  try {
    const record = await commonsSearch(name);
    if (record) return record;
  } catch {
    // Continue to Wikipedia/Wikidata fallbacks.
  }

  let article = null;
  try {
    article = await wikipediaPlayerPage(name);
  } catch {
    article = null;
  }

  if (article?.pageprops?.wikibase_item) {
    try {
      const record = await wikidataImage(article.pageprops.wikibase_item, name);
      if (record) return { ...record, articleTitle: article.title };
    } catch {
      // Continue to the page image fallback.
    }
  }

  if (article?.pageimage) {
    try {
      const record = await commonsFileByTitle(article.pageimage, name, 'wikipedia-pageimage');
      if (record) return { ...record, articleTitle: article.title };
    } catch {
      return null;
    }
  }

  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = String(req.query.name || '').trim();
  const type = String(req.query.type || 'player').trim().toLowerCase();
  if (!name) return res.status(400).json({ error: 'A subject name is required.' });
  if (type !== 'player') return res.status(200).json({ found: false, item: null });

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  const item = await resolvePlayerMedia(name);
  return res.status(200).json({
    found: Boolean(item),
    item,
    policy: 'Playerpedia prefers newer reusable Commons media and only returns manually approved or public-domain/CC BY/CC BY-SA/CC0 files.'
  });
};