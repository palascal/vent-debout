/** Préfixe les liens avec la base du site (racine en local, /vent-debout/ sur GitHub Pages). */
export function href(path: string): string {
  if (!path) return import.meta.env.BASE_URL;
  if (/^https?:\/\//.test(path)) return path;
  const hashAt = path.indexOf('#');
  const hash = hashAt >= 0 ? path.slice(hashAt) : '';
  const pathname = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const base = import.meta.env.BASE_URL;
  if (pathname === '/' || pathname === '') return `${base}${hash}`;
  return `${base}${pathname.replace(/^\//, '')}${hash}`;
}
