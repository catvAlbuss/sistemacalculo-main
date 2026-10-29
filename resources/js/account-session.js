// Server revocation is authoritative. Poll visible authenticated pages without loading payment or calculation code.
export function startAccountSession({ page = document, browser = window, request = fetch, every = setInterval, cancel = clearInterval } = {}) {
  const { accountPing, accountLogin } = page.documentElement.dataset;
  if (!accountPing || !accountLogin) return () => {};
  let running = false, stopped = false;
  const check = async () => {
    if (running || stopped || page.hidden) return;
    running = true;
    try {
      const response = await request(accountPing, { credentials: 'same-origin', headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (response.status === 401 && !stopped) {
        stopped = true;
        browser.location.assign(accountLogin);
      }
    } catch { /* A connection failure must never be mistaken for a revoked account. */ }
    finally { running = false; }
  };
  const timer = every(check, 60000);
  const visible = () => { if (!page.hidden) check(); };
  page.addEventListener('visibilitychange', visible);
  return () => { stopped = true; cancel(timer); page.removeEventListener('visibilitychange', visible); };
}
