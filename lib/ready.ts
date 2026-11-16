/**
 * Tiny "app ready" signal: the loader calls `markReady()` when it leaves,
 * and intro animations (navbar, hero…) wait for it with `onReady()`.
 *
 * State lives on <html data-app-ready> instead of a module variable because
 * layout and page chunks may each get their own copy of this module.
 */
const EVENT = "app:ready";

const isReady = () => document.documentElement.dataset.appReady === "true";

export function markReady() {
  if (isReady()) return;
  document.documentElement.dataset.appReady = "true";
  window.dispatchEvent(new Event(EVENT));
}

export function onReady(cb: () => void): () => void {
  if (isReady()) {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT, cb, { once: true });
  return () => window.removeEventListener(EVENT, cb);
}
