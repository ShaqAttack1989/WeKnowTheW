(() => {
  const form = document.getElementById('problem-report-form');
  if (!form) return;
  const input = document.getElementById('report-page');
  const status = document.getElementById('report-status');
  const submit = document.getElementById('report-submit');
  const email = document.getElementById('report-email-fallback');
  const copy = document.getElementById('report-copy');
  const copyStatus = document.getElementById('report-copy-status');
  const manualCopy = document.getElementById('report-manual-copy');
  const candidate = new URLSearchParams(location.search).get('page') || document.referrer;
  try {
    const url = new URL(candidate);
    if (url.origin === location.origin) {
      const safe = new URL(url.origin + url.pathname + url.hash);
      for (const key of ['team', 'search', 'view', 'player', 'id']) {
        const value = url.searchParams.get(key);
        if (value) safe.searchParams.set(key, value);
      }
      input.value = safe.href;
    }
  } catch {}
  if (!input.value) input.value = location.origin + '/';
  const values = () => Object.fromEntries(new FormData(form));
  const reportText = () => {
    const data = values();
    return `We Know the W problem report\n\nPage: ${data.page || ''}\nCategory: ${data.category || ''}\nName: ${data.name || 'Not provided'}\nReply email: ${data.email || 'Not provided'}\n\n${data.message || ''}`;
  };
  const updateEmail = () => {
    email.href = 'mailto:books@adventuresinzen.com?subject=' + encodeURIComponent('We Know the W problem report') + '&body=' + encodeURIComponent(reportText());
    if (!manualCopy.hidden) manualCopy.value = reportText();
  };
  updateEmail();
  form.addEventListener('input', updateEmail);
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(reportText());
      copyStatus.textContent = 'Report copied. Paste it into an email to books@adventuresinzen.com.';
    } catch {
      manualCopy.hidden = false;
      manualCopy.value = reportText();
      manualCopy.focus();
      manualCopy.select();
      copyStatus.textContent = 'Copy the selected report text, then paste it into your email.';
    }
  });
  submit.disabled = false;
  let pending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    pending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your report. Please keep this page open.';
    status.dataset.state = 'pending';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/report-a-problem', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values()), signal: controller.signal
      });
      const result = await response.json();
      const accepted = response.ok && result.status === 'accepted';
      status.dataset.state = accepted ? 'success' : 'error';
      status.textContent = result.message || 'We could not confirm your submission. Use the email or copy option below.';
      // Retain entered text even on acceptance so the reader always has a copy.
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'We could not confirm your submission. Your text is still here. Use the email or copy option below; retrying may send a duplicate.';
    } finally {
      clearTimeout(timer);
      pending = false;
      submit.disabled = false;
      submit.textContent = 'Submit problem report';
      form.setAttribute('aria-busy', 'false');
      updateEmail();
    }
  });
})();
