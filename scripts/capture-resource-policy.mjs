export function canLoadCaptureResource(address, type, origin, devOrigin = '') {
  try {
    const url = new URL(address);
    if (url.username || url.password) return false;
    if (url.protocol === 'data:') return ['stylesheet','font','image'].includes(type);
    if (!['stylesheet','font','image'].includes(type)) return false;
    if (url.origin === origin && /^\/(?:build|assets|media)\//.test(url.pathname)) return true;
    if (devOrigin && url.origin === devOrigin && ['localhost','127.0.0.1','[::1]'].includes(url.hostname)
        && /^\/(?:resources|node_modules|@fs)\//.test(url.pathname)) return true;
    return url.protocol === 'https:' && !url.port && ['fonts.bunny.net','cdnjs.cloudflare.com'].includes(url.hostname);
  } catch { return false; }
}
