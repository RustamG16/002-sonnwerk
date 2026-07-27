/** Prefix site-root paths for GitHub Pages base (and stay `/` on Netlify). */
export function withBase(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!path || path === '/') return `${base}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
