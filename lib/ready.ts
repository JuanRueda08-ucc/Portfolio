/**
 * Tiny "app ready" signal: the loader calls `markReady()` when it leaves,
 * and intro animations (navbar, hero…) wait for it with `onReady()`.
 */
let ready = false;
const EVENT = "app:ready";

export function markReady() {
  if (ready) return;
  ready = true;
  window.dispatchEvent(new Event(EVENT));
}

export function onReady(cb: () => void): () => void {
  if (ready) {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT, cb, { once: true });
  return () => window.removeEventListener(EVENT, cb);
}
