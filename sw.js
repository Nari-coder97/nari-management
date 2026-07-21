// nari-management Service Worker
// HTML本体はネットワーク優先（更新をすぐ反映）、アイコン等はキャッシュ優先。オフラインでも起動可能。
const CACHE = "nari-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-180.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== "GET") return; // Supabase等はそのまま
  const isHTML = e.request.mode === "navigate" ||
    url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (isHTML) {
    // ネットワーク優先：最新を取得、失敗時（オフライン）はキャッシュ
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
    );
  } else {
    // 静的ファイルはキャッシュ優先
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }))
    );
  }
});
