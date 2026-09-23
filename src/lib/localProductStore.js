// DummyJSON doesn't actually persist add/edit/delete on its server.
// This module fakes persistence on top of the real API calls, using
// localStorage, so changes survive a page refresh during your session.
//
// Shape stored in localStorage under "productOverrides":
// {
//   added:   [ {..full product object with a temporary id..}, ... ],
//   edited:  { [productId]: {...fields that changed...}, ... },
//   deleted: [ productId, productId, ... ]
// }

const STORAGE_KEY = "productOverrides";

function readStore() {
  if (typeof window === "undefined") return { added: [], edited: {}, deleted: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { added: [], edited: {}, deleted: [] };
    return JSON.parse(raw);
  } catch {
    return { added: [], edited: {}, deleted: [] };
  }
}

function writeStore(store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function addLocalProduct(product) {
  const store = readStore();
  // Fake ids start high so they don't collide with real DummyJSON ids (1–194)
  const newProduct = { ...product, id: Date.now() };
  store.added = [newProduct, ...store.added];
  writeStore(store);
  return newProduct;
}

export function editLocalProduct(id, changes) {
  const store = readStore();
  store.edited[id] = { ...(store.edited[id] || {}), ...changes };
  writeStore(store);
}

export function deleteLocalProduct(id) {
  const store = readStore();
  if (!store.deleted.includes(id)) {
    store.deleted.push(id);
  }
  writeStore(store);
}

// Applies all local overrides on top of a list of products fetched from the API:
// - removes deleted ids
// - merges in edits
// - prepends locally-added products (only relevant on an unfiltered, first-page view)
export function applyOverrides(products) {
  const store = readStore();
  let result = products
    .filter((p) => !store.deleted.includes(p.id))
    .map((p) => (store.edited[p.id] ? { ...p, ...store.edited[p.id] } : p));
  return result;
}

export function getLocalAddedProducts() {
  return readStore().added;
}

export function getLocalEditsForProduct(id) {
  return readStore().edited[id] || null;
}

export function isLocallyDeleted(id) {
  return readStore().deleted.includes(id);
}