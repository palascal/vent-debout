export function formatDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `tel:+33${digits.slice(1)}`;
  if (!digits) return 'tel:';
  return `tel:+${digits}`;
}

export function mapHref(address: string): string {
  const query = address.replace(/\s*\n\s*/g, ', ');
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

export function published<T extends { published: boolean; title?: string }>(items: T[]): T[] {
  return items.filter((item) => item.published && item.title?.trim());
}

export function byOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function featuredFirst<T extends { featured?: boolean; order: number }>(items: T[], count: number): T[] {
  const ranked = [...items].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
  return ranked.slice(0, count);
}
