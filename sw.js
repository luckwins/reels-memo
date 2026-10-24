// 앱 화면 파일만 캐시. 항상 네트워크를 먼저 쓰고, 안 되면 캐시로 열어서 오프라인에서도 메모는 남길 수 있게 함.
const CACHE = 'reels-memo-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy));
        return res;
      })
      .catch(() => caches.match(req.mode === 'navigate' ? './index.html' : req, { ignoreSearch: true }))
  );
});
