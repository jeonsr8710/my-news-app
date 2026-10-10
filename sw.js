const CACHE_NAME = 'news-pwa-v2';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// 설치: 앱 셸 파일 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 패치 이벤트: 뉴스 API 요청은 캐시를 거치지 않고 실시간 요청
// fetch 이벤트 리스너 부분을 아래처럼 교체
self.addEventListener('fetch', (event) => {
  // 뉴스 프록시 요청은 캐시하지 않고 무조건 네트워크로 통과
  if (event.request.url.includes('corsproxy.io') || event.request.url.includes('allorigins.win')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
