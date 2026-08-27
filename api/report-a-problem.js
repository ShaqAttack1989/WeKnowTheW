const { createHash } = require('node:crypto');

const RECIPIENT = 'books@adventuresinzen.com';
const ORIGINS = new Set(['https://www.weknowthew.com', 'https://weknowthew.com']);
const CATEGORIES = new Set([
  'Statistics or factual correction', 'Broken link or navigation',
  'Missing or incorrect image', 'Accessibility or mobile display',
  'Image credit or rights concern', 'Other'
]);
// Best-effort per-instance throttling, in addition to provider filtering.
// No report contents or raw IP addresses are stored or logged here.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;

function allowAttempt(req) {
  const now = Date.now();
  for (const [key, record] of attempts) if (record.expires <= now) attempts.delete(key);
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const key = createHash('sha256').update(ip).digest('hex');
  const record = attempts.get(key) || { count: 0, expires: now + WINDOW_MS };
  if (record.count >= 5 || (!attempts.has(key) && attempts.size >= 2000)) return false;
  record.count += 1;
  attempts.set(key, record);
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'error', message: 'Submit the form to send a report.' });
  }
  if (!ORIGINS.has(req.headers.origin)) {
    return res.status(403).json({ status: 'error', message: 'Please submit from We Know the W.' });
  }
  if (String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.status(415).json({ status: 'error', message: 'The report must use JSON.' });
  }
  let body;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (Buffer.byteLength(raw) > 32768) throw new Error('Too large');
    body = typeof req.body === 'string' ? JSON.parse(raw) : req.body;
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('Invalid body');
  } catch {
    return res.status(400).json({ status: 'error', message: 'Please check the report fields and try again.' });
  }
  const limits = { name: 100, email: 254, page: 2000, category: 80, message: 6000, _honey: 200 };
  const report = {};
  for (const [key, max] of Object.entries(limits)) {
    if (body[key] !== undefined && typeof body[key] !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Please check the report fields.' });
    }
    report[key] = (body[key] || '').trim();
    if (report[key].length > max) {
      return res.status(400).json({ status: 'error', message: 'One of the report fields is too long.' });
    }
  }
  let page;
  try { page = new URL(report.page); } catch {}
  if (report._honey || !CATEGORIES.has(report.category) || report.message.length < 10
      || !page || !ORIGINS.has(page.origin) || page.username || page.password
      || (report.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(report.email))
      || /[\r\n]/.test(report.name)) {
    return res.status(400).json({ status: 'error', message: 'Check the page address, category, email, and description (at least 10 characters).' });
  }
  if (!allowAttempt(req)) {
    res.setHeader('Retry-After', '900');
    return res.status(429).json({ status: 'error', message: 'Too many attempts. Please wait 15 minutes or email your report directly.' });
  }
  // Never relay client-supplied routing, CC, webhook, or recipient settings.
  const payload = {
    name: report.name || 'Website reader', page: report.page,
    category: report.category, message: report.message,
    _subject: 'We Know the W · Problem report', _template: 'table',
    _url: 'https://www.weknowthew.com/report-a-problem.html'
  };
  if (report.email) payload.email = report.email;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal, redirect: 'error'
    });
    const result = await response.json();
    const message = String(result?.message || '');
    if (response.ok && /activat|confirm|verif|check.*inbox/i.test(message)) {
      return res.status(202).json({ status: 'activation_required', message: 'Email delivery is awaiting confirmation by the site owner. Your report has not been confirmed as sent. Please use the email option below.' });
    }
    if (!response.ok || (result?.success !== true && result?.success !== 'true')) {
      return res.status(502).json({ status: 'error', message: 'The email service did not accept this report. Your text is still here; please use the email or copy option below.' });
    }
    return res.status(200).json({ status: 'accepted', message: 'The email service accepted your report for processing. Thank you. Inbox delivery is not confirmed here.' });
  } catch {
    return res.status(503).json({ status: 'error', message: 'We could not confirm your submission. Your text is still here. Please use the email or copy option below; retrying may send a duplicate if the first request reached the service.' });
  } finally {
    clearTimeout(timer);
  }
};
