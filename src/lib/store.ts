import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { list, put } from '@vercel/blob';
import seed from '../../data/site.json';
import {
  PRODUCT_KINDS,
  TARIF_CATEGORIES,
  type Actu,
  type Coords,
  type Produit,
  type ProductKind,
  type Realisation,
  type SiteData,
  type Tarif,
  type TarifCategory,
} from './types';

const FILE = path.join(process.cwd(), 'data', 'site.json');
const BLOB_PATH = 'site/content.json';

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

function text(value: unknown, max = 5000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function slug(value: unknown, prefix: string): string {
  const raw = text(value, 80).replace(/[^\w-]/g, '');
  return raw || `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function category(value: unknown): TarifCategory {
  return TARIF_CATEGORIES.includes(value as TarifCategory) ? (value as TarifCategory) : 'revision';
}

function kind(value: unknown): ProductKind {
  return PRODUCT_KINDS.includes(value as ProductKind) ? (value as ProductKind) : 'accessoire';
}

function coords(value: unknown): Coords {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    repairer: text(row.repairer, 120) || 'Jérémie Faure',
    tagline: text(row.tagline, 180),
    about: text(row.about),
    email: text(row.email, 180),
    phone: text(row.phone, 40),
    address: text(row.address, 500),
    hours: text(row.hours, 800),
    shipping: text(row.shipping),
    promo: text(row.promo, 220),
    promoLabel: text(row.promoLabel, 80),
    promoHref: text(row.promoHref, 200) || '/tarifs/',
  };
}

export function normalize(input: unknown): SiteData {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const tarifs = Array.isArray(row.tarifs) ? row.tarifs.slice(0, 200).map(tarif) : [];
  const realisations = Array.isArray(row.realisations) ? row.realisations.slice(0, 200).map(realisation) : [];
  const produits = Array.isArray(row.produits) ? row.produits.slice(0, 200).map(produit) : [];
  const actualites = Array.isArray(row.actualites) ? row.actualites.slice(0, 200).map(actu) : [];
  return { coords: coords(row.coords), tarifs, realisations, produits, actualites };
}

function tarif(value: unknown, index: number): Tarif {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: slug(row.id, 'tarif'),
    category: category(row.category),
    title: text(row.title, 180),
    detail: text(row.detail),
    price: text(row.price, 80),
    featured: flag(row.featured, false),
    published: flag(row.published, true),
    order: num(row.order) || index + 1,
  };
}

function realisation(value: unknown, index: number): Realisation {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: slug(row.id, 'real'),
    title: text(row.title, 180),
    instrument: text(row.instrument, 120),
    year: text(row.year, 12),
    text: text(row.text),
    imageUrl: text(row.imageUrl, 500),
    featured: flag(row.featured, false),
    published: flag(row.published, true),
    order: num(row.order) || index + 1,
  };
}

function produit(value: unknown, index: number): Produit {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: slug(row.id, 'produit'),
    kind: kind(row.kind),
    title: text(row.title, 180),
    price: text(row.price, 80),
    text: text(row.text),
    imageUrl: text(row.imageUrl, 500),
    available: flag(row.available, true),
    featured: flag(row.featured, false),
    published: flag(row.published, true),
    order: num(row.order) || index + 1,
  };
}

function actu(value: unknown): Actu {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: slug(row.id, 'actu'),
    title: text(row.title, 180),
    date: text(row.date, 20),
    text: text(row.text),
    published: flag(row.published, true),
  };
}

async function readBlob(): Promise<SiteData | null> {
  const token = blobToken();
  if (!token) return null;
  const { blobs } = await list({ prefix: 'site/', token });
  const content = blobs.find((blob) => blob.pathname === BLOB_PATH);
  if (!content) return null;
  const response = await fetch(`${content.url}?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return normalize(await response.json());
}

async function readFileSite(): Promise<SiteData> {
  try {
    const raw = await readFile(FILE, 'utf8');
    return normalize(JSON.parse(raw));
  } catch {
    return normalize(seed);
  }
}

export async function readSite(): Promise<SiteData> {
  try {
    const remote = await readBlob();
    if (remote) return remote;
  } catch (error) {
    console.warn('[cms] lecture blob impossible:', error);
  }
  return readFileSite();
}

export async function writeSite(input: unknown): Promise<SiteData> {
  const site = normalize(input);
  const token = blobToken();
  if (token) {
    await put(BLOB_PATH, JSON.stringify(site, null, 2), {
      access: 'public',
      token,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }
  if (!token || import.meta.env.DEV) {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, `${JSON.stringify(site, null, 2)}\n`, 'utf8');
  }
  return site;
}
