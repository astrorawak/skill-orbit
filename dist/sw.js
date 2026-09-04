/* SKILL//ORBIT — service worker
   - Mengaktifkan installasi PWA & "Add to Home Screen" di HP.
   - Cache-first untuk aset same-origin: setelah kunjungan pertama,
     aplikasi tetap bisa dibuka (offline) setelah terdampak jaringan.
*/
const CACHE = "skill-orbit-v1";
const CORE = ["./", "./index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  // API cloud & GitHub: biarkan network dulu, jangan di-cache buta.
  if (req.url.includes("whitesmoke-wallaby") || req.url.includes("api.github.com")) return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
