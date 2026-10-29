export function csrfHeaders(headers = {}) {
  const token = typeof document === 'undefined' ? null : document.querySelector('meta[name="csrf-token"]')?.content;
  return token ? { ...headers, 'X-CSRF-TOKEN': token } : headers;
}
