const CACHE_VERSION = "v1";
const STATIC_CACHE = `tink-static-${CACHE_VERSION}`;
const PRECACHE_URLS = ["/css/critical.css", "/css/blog.css", "/js/scripts.js", "/offline/"];
const STATIC_ASSET_PATTERN = /\.(css|js|png|jpe?g|svg|webp|gif|woff2?|ttf|ico)$/;

self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(STATIC_CACHE)
.then((cache) => cache.addAll(PRECACHE_URLS))
.then(() => self.skipWaiting())
);
});

self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys()
.then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
.then(() => self.clients.claim())
);
});

self.addEventListener("fetch", (event) => {
const { request } = event;

if (request.method !== "GET") {
return;
}

const url = new URL(request.url);

if (url.origin !== self.location.origin) {
return;
}

if (request.mode === "navigate") {
event.respondWith(networkFirst(request));
return;
}

if (STATIC_ASSET_PATTERN.test(url.pathname)) {
event.respondWith(cacheFirst(request));
}
});

async function networkFirst(request) {
try {
const response = await fetch(request);
const cache = await caches.open(STATIC_CACHE);
cache.put(request, response.clone());
return response;
} catch (error) {
return (await caches.match(request)) || caches.match("/offline/");
}
}

async function cacheFirst(request) {
const cached = await caches.match(request);

if (cached) {
return cached;
}

const response = await fetch(request);
const cache = await caches.open(STATIC_CACHE);
cache.put(request, response.clone());
return response;
}
