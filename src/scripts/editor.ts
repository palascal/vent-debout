import { CATEGORY_LABELS, KIND_LABELS, PRODUCT_KINDS, TARIF_CATEGORIES, type SiteData } from '../lib/types';

const dataNode = document.getElementById('site-data');
const panel = document.getElementById('panel');
const status = document.getElementById('status');
const saveButton = document.getElementById('save');
if (!dataNode || !panel || !status || !saveButton) throw new Error('Éditeur incomplet');

let state = JSON.parse(dataNode.textContent || '{}') as SiteData;
let tab = 'coords';
let dirty = false;

const tabs: [string, string][] = [
  ['coords', 'Coordonnées'],
  ['tarifs', 'Tarifs'],
  ['realisations', 'Réalisations'],
  ['produits', 'Vente'],
  ['actualites', 'Actualités'],
];

function mark() {
  dirty = true;
  status.textContent = 'Modifications non enregistrées';
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function move<T>(list: T[], index: number, dir: -1 | 1) {
  const next = index + dir;
  if (next < 0 || next >= list.length) return;
  const [item] = list.splice(index, 1);
  list.splice(next, 0, item);
  list.forEach((entry, order) => {
    if (entry && typeof entry === 'object' && 'order' in entry) (entry as { order: number }).order = order + 1;
  });
  mark();
  render();
}

function field(label: string, value: string, onValue: (value: string) => void, area = false) {
  const wrap = document.createElement('label');
  wrap.className = 'ed-field';
  const span = document.createElement('span');
  span.textContent = label;
  const input = document.createElement(area ? 'textarea' : 'input');
  input.value = value;
  if (!area) input.type = 'text';
  input.addEventListener('input', () => {
    onValue(input.value);
    mark();
  });
  wrap.append(span, input);
  return wrap;
}

function select(label: string, value: string, options: [string, string][], onValue: (value: string) => void) {
  const wrap = document.createElement('label');
  wrap.className = 'ed-field';
  const span = document.createElement('span');
  span.textContent = label;
  const input = document.createElement('select');
  options.forEach(([key, name]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = name;
    option.selected = key === value;
    input.append(option);
  });
  input.addEventListener('change', () => {
    onValue(input.value);
    mark();
  });
  wrap.append(span, input);
  return wrap;
}

function check(label: string, value: boolean, onValue: (value: boolean) => void) {
  const wrap = document.createElement('label');
  wrap.className = 'ed-check';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = value;
  input.addEventListener('change', () => {
    onValue(input.checked);
    mark();
  });
  wrap.append(input, document.createTextNode(label));
  return wrap;
}

function iconButton(label: string, onClick: () => void, danger = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = danger ? 'ed-btn danger' : 'ed-btn';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function card(title: string, body: HTMLElement[], actions: HTMLButtonElement[]) {
  const article = document.createElement('article');
  article.className = 'ed-card';
  const heading = document.createElement('h3');
  heading.textContent = title || 'Sans titre';
  const grid = document.createElement('div');
  grid.className = 'ed-grid';
  grid.append(...body);
  const bar = document.createElement('div');
  bar.className = 'ed-actions';
  bar.append(...actions);
  article.append(heading, grid, bar);
  return article;
}

function renderCoords() {
  const coords = state.coords;
  const box = document.createElement('div');
  box.className = 'ed-grid';
  box.append(
    field('Réparateur', coords.repairer, (value) => { coords.repairer = value; }),
    field('Sous-titre', coords.tagline, (value) => { coords.tagline = value; }),
    field('Téléphone', coords.phone, (value) => { coords.phone = value; }),
    field('E-mail', coords.email, (value) => { coords.email = value; }),
    field('Texte d’accueil', coords.about, (value) => { coords.about = value; }, true),
    field('Adresse', coords.address, (value) => { coords.address = value; }, true),
    field('Horaires', coords.hours, (value) => { coords.hours = value; }, true),
    field('Envoi d’un instrument', coords.shipping, (value) => { coords.shipping = value; }, true),
    field('Bandeau', coords.promo, (value) => { coords.promo = value; }),
    field('Libellé du bandeau', coords.promoLabel, (value) => { coords.promoLabel = value; }),
    field('Lien du bandeau', coords.promoHref, (value) => { coords.promoHref = value; }),
  );
  panel?.append(box);
}

function renderTarifs() {
  state.tarifs.forEach((item, index) => {
    panel?.append(card(item.title, [
      field('Titre', item.title, (value) => { item.title = value; }),
      select('Rubrique', item.category, TARIF_CATEGORIES.map((key) => [key, CATEGORY_LABELS[key]]), (value) => { item.category = value as typeof item.category; }),
      field('Prix', item.price, (value) => { item.price = value; }),
      field('Détail', item.detail, (value) => { item.detail = value; }, true),
      check('Publié', item.published, (value) => { item.published = value; }),
      check('En avant sur l’accueil', item.featured, (value) => { item.featured = value; }),
    ], [
      iconButton('Monter', () => move(state.tarifs, index, -1)),
      iconButton('Descendre', () => move(state.tarifs, index, 1)),
      iconButton('Supprimer', () => { state.tarifs.splice(index, 1); mark(); render(); }, true),
    ]));
  });
  panel?.append(iconButton('Ajouter un tarif', () => {
    state.tarifs.push({
      id: uid('tarif'), category: 'revision', title: '', detail: '', price: '', featured: false, published: true, order: state.tarifs.length + 1,
    });
    mark();
    render();
  }));
}

function renderWorks() {
  state.realisations.forEach((item, index) => {
    panel?.append(card(item.title, [
      field('Titre', item.title, (value) => { item.title = value; }),
      field('Instrument', item.instrument, (value) => { item.instrument = value; }),
      field('Année', item.year, (value) => { item.year = value; }),
      field('Texte', item.text, (value) => { item.text = value; }, true),
      field('Image (URL)', item.imageUrl, (value) => { item.imageUrl = value; }),
      check('Publié', item.published, (value) => { item.published = value; }),
      check('En avant sur l’accueil', item.featured, (value) => { item.featured = value; }),
    ], [
      iconButton('Monter', () => move(state.realisations, index, -1)),
      iconButton('Descendre', () => move(state.realisations, index, 1)),
      iconButton('Supprimer', () => { state.realisations.splice(index, 1); mark(); render(); }, true),
    ]));
  });
  panel?.append(iconButton('Ajouter une réalisation', () => {
    state.realisations.push({
      id: uid('real'), title: '', instrument: '', year: String(new Date().getFullYear()), text: '', imageUrl: '', featured: false, published: true, order: state.realisations.length + 1,
    });
    mark();
    render();
  }));
}

function renderProducts() {
  state.produits.forEach((item, index) => {
    panel?.append(card(item.title, [
      field('Titre', item.title, (value) => { item.title = value; }),
      select('Rayon', item.kind, PRODUCT_KINDS.map((key) => [key, KIND_LABELS[key]]), (value) => { item.kind = value as typeof item.kind; }),
      field('Prix', item.price, (value) => { item.price = value; }),
      field('Texte', item.text, (value) => { item.text = value; }, true),
      field('Image (URL)', item.imageUrl, (value) => { item.imageUrl = value; }),
      check('Publié', item.published, (value) => { item.published = value; }),
      check('Encore en vente', item.available, (value) => { item.available = value; }),
      check('En avant sur l’accueil', item.featured, (value) => { item.featured = value; }),
    ], [
      iconButton('Monter', () => move(state.produits, index, -1)),
      iconButton('Descendre', () => move(state.produits, index, 1)),
      iconButton('Supprimer', () => { state.produits.splice(index, 1); mark(); render(); }, true),
    ]));
  });
  panel?.append(iconButton('Ajouter un article', () => {
    state.produits.push({
      id: uid('produit'), kind: 'occasion', title: '', price: '', text: '', imageUrl: '', available: true, featured: false, published: true, order: state.produits.length + 1,
    });
    mark();
    render();
  }));
}

function renderNews() {
  const sorted = [...state.actualites].sort((a, b) => b.date.localeCompare(a.date));
  sorted.forEach((item) => {
    panel?.append(card(item.title, [
      field('Titre', item.title, (value) => { item.title = value; }),
      field('Date (AAAA-MM-JJ)', item.date, (value) => { item.date = value; }),
      field('Texte', item.text, (value) => { item.text = value; }, true),
      check('Publié', item.published, (value) => { item.published = value; }),
    ], [
      iconButton('Supprimer', () => {
        state.actualites = state.actualites.filter((entry) => entry.id !== item.id);
        mark();
        render();
      }, true),
    ]));
  });
  panel?.append(iconButton('Ajouter une actualité', () => {
    state.actualites.unshift({
      id: uid('actu'), title: '', date: new Date().toISOString().slice(0, 10), text: '', published: true,
    });
    mark();
    render();
  }));
}

function render() {
  if (!panel) return;
  panel.replaceChildren();
  if (tab === 'coords') renderCoords();
  if (tab === 'tarifs') renderTarifs();
  if (tab === 'realisations') renderWorks();
  if (tab === 'produits') renderProducts();
  if (tab === 'actualites') renderNews();
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.classList.toggle('is-on', button.dataset.tab === tab);
  });
}

document.getElementById('tabs')?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tab]');
  if (!button?.dataset.tab) return;
  tab = button.dataset.tab;
  render();
});

if (import.meta.env.PROD) {
  saveButton.hidden = true;
  status.textContent = 'Site publié, en lecture seule. Les modifications se font en local avec npm run dev.';
}

saveButton.addEventListener('click', async () => {
  saveButton.setAttribute('disabled', 'true');
  status.textContent = 'Enregistrement…';
  try {
    const response = await fetch('/api/content/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Erreur');
    state = payload.site;
    dirty = false;
    status.textContent = 'Enregistré. Rechargez le site pour voir le résultat.';
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Erreur';
  } finally {
    saveButton.removeAttribute('disabled');
  }
});

window.addEventListener('beforeunload', (event) => {
  if (!dirty) return;
  event.preventDefault();
});

render();
