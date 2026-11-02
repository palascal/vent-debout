export const TARIF_CATEGORIES = ['revision', 'brasure', 'retamponnage', 'divers'] as const;
export type TarifCategory = (typeof TARIF_CATEGORIES)[number];

export const PRODUCT_KINDS = ['neuf', 'occasion', 'accessoire'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const CATEGORY_LABELS: Record<TarifCategory, string> = {
  revision: 'Révision et entretien',
  brasure: 'Brasures',
  retamponnage: 'Retamponnage',
  divers: 'Débosselage, liège, pièces',
};

export const KIND_LABELS: Record<ProductKind, string> = {
  neuf: 'Neuf',
  occasion: 'Occasion',
  accessoire: 'Accessoire',
};

export type Coords = {
  repairer: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  shipping: string;
  promo: string;
  promoLabel: string;
  promoHref: string;
};

export type Tarif = {
  id: string;
  category: TarifCategory;
  title: string;
  detail: string;
  price: string;
  featured: boolean;
  published: boolean;
  order: number;
};

export type Realisation = {
  id: string;
  title: string;
  instrument: string;
  year: string;
  text: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
  order: number;
};

export type Produit = {
  id: string;
  kind: ProductKind;
  title: string;
  price: string;
  text: string;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  published: boolean;
  order: number;
};

export type Actu = {
  id: string;
  title: string;
  date: string;
  text: string;
  published: boolean;
};

export type SiteData = {
  coords: Coords;
  tarifs: Tarif[];
  realisations: Realisation[];
  produits: Produit[];
  actualites: Actu[];
};
